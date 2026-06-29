import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { registerUser, loginUser, getProfile, updateProfile, setUserToken, getUserToken } from "../services/api";

const PROFILE_KEY = "ewaine-user-profile";

const UserContext = createContext(null);

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile);
  const [loading, setLoading] = useState(!!getUserToken());

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((data) => {
        setProfile(data);
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch {}
      })
      .catch(() => {
        setUserToken(null);
        setProfile(null);
        localStorage.removeItem(PROFILE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser(name, email, password);
    setUserToken(data.token);
    const p = { email: data.email, name: data.name, phone: "" };
    setProfile(p);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    setUserToken(data.token);
    const p = { email: data.email, name: data.name, phone: "" };
    setProfile(p);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
    return data;
  }, []);

  const logout = useCallback(() => {
    setUserToken(null);
    setProfile(null);
    localStorage.removeItem(PROFILE_KEY);
  }, []);

  const saveProfile = useCallback(async (data) => {
    const token = getUserToken();
    if (token) {
      try {
        const updated = await updateProfile(data);
        setProfile(updated);
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch {}
        return;
      } catch {}
    }
    setProfile(data);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    try { localStorage.removeItem(PROFILE_KEY); } catch {}
  }, []);

  return (
    <UserContext.Provider value={{ profile, loading, register, login, logout, saveProfile, clearProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
