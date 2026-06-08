import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Plus, Edit3, Trash2, Search, X } from "lucide-react";

const emptyHotel = {
  name: "",
  description: "",
  price: "",
  rating: "",
  city: "",
  state: "",
  address: "",
  amenities: [],
  images: [""],
  featured: false,
  available: true,
  roomTypes: [{ type: "Standard", price: "", available: "" }],
  phone: "",
  email: "",
  website: "",
};

const amenityOptions = [
  "Swimming Pool",
  "WiFi",
  "Restaurant",
  "Gym",
  "Parking",
  "Air Conditioning",
  "Free Breakfast",
  "Pet Friendly",
];

export default function AdminHotels() {
  const { hotels, addHotel, updateHotel, deleteHotel } = useAdmin();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyHotel });

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyHotel,
      images: [""],
      roomTypes: [{ type: "Standard", price: "", available: "" }],
    });
    setShowModal(true);
  };

  const openEdit = (hotel) => {
    setEditing(hotel);
    setForm({
      ...hotel,
      price: String(hotel.price),
      rating: String(hotel.rating),
      roomTypes: hotel.roomTypes.map((r) => ({
        ...r,
        price: String(r.price),
        available: String(r.available),
      })),
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
      roomTypes: form.roomTypes.map((r) => ({
        type: r.type,
        price: Number(r.price),
        available: Number(r.available),
      })),
      images: form.images.filter(Boolean),
    };
    if (editing) {
      updateHotel(editing.id, payload);
    } else {
      addHotel(payload);
    }
    setShowModal(false);
  };

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hotels</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Hotel
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search hotels..."
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
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">City</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Rating</th>
                <th className="p-3 font-medium">Available</th>
                <th className="p-3 font-medium">Featured</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hotel) => (
                <tr
                  key={hotel.id}
                  className="border-b border-border/50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-bg/30"
                >
                  <td className="p-3 font-medium">{hotel.name}</td>
                  <td className="p-3 text-text-secondary">{hotel.city}</td>
                  <td className="p-3">${hotel.price}</td>
                  <td className="p-3">{hotel.rating}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hotel.available ? "bg-success" : "bg-error"
                      }`}
                    />
                  </td>
                  <td className="p-3">
                    {hotel.featured ? (
                      <span className="text-secondary font-bold">Yes</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(hotel)}
                        className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this hotel?"))
                            deleteHotel(hotel.id);
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
                  <td
                    colSpan={7}
                    className="p-8 text-center text-text-secondary"
                  >
                    No hotels found.
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
            className="w-full max-w-2xl bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-border dark:border-dark-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
              <h2 className="text-lg font-bold">
                {editing ? "Edit Hotel" : "Add Hotel"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price ($/night)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                    min={0}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: e.target.value })
                    }
                    required
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amenityOptions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          form.amenities.includes(a)
                            ? "bg-primary text-white border-primary"
                            : "border-border dark:border-dark-border text-text-secondary hover:border-primary"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Image URLs
                  </label>
                  {form.images.map((url, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={url}
                        onChange={(e) => {
                          const imgs = [...form.images];
                          imgs[i] = e.target.value;
                          setForm({ ...form, images: imgs });
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              images: form.images.filter((_, j) => j !== i),
                            })
                          }
                          className="p-2 text-text-secondary hover:text-error"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, images: [...form.images, ""] })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Add another image
                  </button>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Room Types
                  </label>
                  {form.roomTypes.map((rt, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-end">
                      <div className="flex-1">
                        <input
                          value={rt.type}
                          onChange={(e) => {
                            const rts = [...form.roomTypes];
                            rts[i] = { ...rts[i], type: e.target.value };
                            setForm({ ...form, roomTypes: rts });
                          }}
                          placeholder="Type (e.g. Deluxe)"
                          className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={rt.price}
                          onChange={(e) => {
                            const rts = [...form.roomTypes];
                            rts[i] = { ...rts[i], price: e.target.value };
                            setForm({ ...form, roomTypes: rts });
                          }}
                          placeholder="Price"
                          className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={rt.available}
                          onChange={(e) => {
                            const rts = [...form.roomTypes];
                            rts[i] = {
                              ...rts[i],
                              available: e.target.value,
                            };
                            setForm({ ...form, roomTypes: rts });
                          }}
                          placeholder="Qty"
                          className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      {form.roomTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              roomTypes: form.roomTypes.filter(
                                (_, j) => j !== i
                              ),
                            })
                          }
                          className="p-2 text-text-secondary hover:text-error"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        roomTypes: [
                          ...form.roomTypes,
                          { type: "", price: "", available: "" },
                        ],
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Add room type
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Website
                  </label>
                  <input
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) =>
                        setForm({ ...form, available: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Available
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Featured
                  </label>
                </div>
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
                  {editing ? "Save Changes" : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
