import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Plus, Edit3, Trash2, Search, X, Star } from "lucide-react";

const emptyTestimonial = {
  name: "",
  role: "",
  avatar: "",
  rating: 5,
  text: "",
};

export default function AdminTestimonials() {
  const { testimonials, refreshTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyTestimonial });

  useEffect(() => {
    refreshTestimonials();
  }, [refreshTestimonials]);

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyTestimonial });
    setShowModal(true);
  };

  const openEdit = (testimonial) => {
    setEditing(testimonial);
    setForm({
      name: testimonial.name,
      role: testimonial.role || "",
      avatar: testimonial.avatar || "",
      rating: testimonial.rating || 5,
      text: testimonial.text || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      rating: Number(form.rating),
    };
    if (editing) {
      await updateTestimonial(editing.id, payload);
    } else {
      await addTestimonial(payload);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search testimonials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                <th className="p-3 font-medium">Avatar</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Rating</th>
                <th className="p-3 font-medium">Text</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-bg/30">
                  <td className="p-3">
                    <img
                      src={t.avatar || `https://i.pravatar.cc/40?img=${t.id}`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                      onError={(e) => { e.target.src = `https://i.pravatar.cc/40?img=${t.id}`; }}
                    />
                  </td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 text-text-secondary">{t.role || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span>{t.rating}</span>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary max-w-xs truncate">{t.text}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this testimonial?"))
                            deleteTestimonial(t.id);
                        }}
                        className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-error transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No testimonials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/50 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-border dark:border-dark-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
              <h2 className="text-lg font-bold">
                {editing ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Business Traveler"
                  className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://i.pravatar.cc/150?img=1"
                  className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className={`p-1 rounded-lg transition-colors ${
                        n <= form.rating ? "text-secondary" : "text-border"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${n <= form.rating ? "fill-secondary" : ""}`} />
                    </button>
                  ))}
                  <span className="text-sm text-text-secondary ml-2">{form.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  {editing ? "Save Changes" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
