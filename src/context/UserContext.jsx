import { createContext, useContext, useState } from "react";

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

  const saveProfile = (data) => {
    setProfile(data);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  };

  const clearProfile = () => {
    setProfile(null);
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <UserContext.Provider value={{ profile, saveProfile, clearProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
