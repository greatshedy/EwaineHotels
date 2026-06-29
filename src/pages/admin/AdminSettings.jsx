import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Save, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const { whatsapp, refreshSettings, updateWhatsApp } = useAdmin();
  const [number, setNumber] = useState("");

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    setNumber(whatsapp);
  }, [whatsapp]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!number.trim()) {
      toast.error("WhatsApp number is required");
      return;
    }
    const ok = await updateWhatsApp(number.trim());
    if (ok) {
      toast.success("WhatsApp number updated");
    } else {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number for Bookings</label>
            <p className="text-xs text-text-secondary mb-3">All booking notifications will be sent to this number via WhatsApp.</p>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="2348080769019"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </form>
      </div>
    </div>
  );
}
