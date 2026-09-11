import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string;
  time: string;
  location: string;
  zoom_link: string | null;
  capacity: number;
  registered: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  date: string;
  time: string;
  location: string;
  zoom_link: string;
  capacity: string;
  registered: string;
  published: boolean;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    image_url: "",
    date: "",
    time: "",
    location: "",
    zoom_link: "",
    capacity: "100",
    registered: "0",
    published: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as any).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        zoom_link: formData.zoom_link || null,
        capacity: parseInt(formData.capacity),
        registered: parseInt(formData.registered),
        published: formData.published,
      };

      if (editingId) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase.from("events").insert([eventData]);
        if (error) throw error;
        toast.success("Event created successfully");
      }

      resetForm();
      fetchEvents();
    } catch (err) {
      toast.error("Failed to save event");
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      image_url: event.image_url || "",
      date: event.date,
      time: event.time,
      location: event.location,
      zoom_link: event.zoom_link || "",
      capacity: event.capacity.toString(),
      registered: event.registered.toString(),
      published: event.published,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleTogglePublish = async (event: Event) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ published: !event.published })
        .eq("id", event.id);
      if (error) throw error;
      toast.success(
        event.published ? "Event unpublished" : "Event published"
      );
      fetchEvents();
    } catch (err) {
      toast.error("Failed to update event");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      date: "",
      time: "",
      location: "",
      zoom_link: "",
      capacity: "100",
      registered: "0",
      published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#0b0b2c]">Events Manager</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-[8px] hover:bg-[#2a2ad6] transition-colors"
        >
          <Plus size={18} />
          New Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[12px] border border-slate-200 p-6 space-y-4"
        >
          <h3 className="text-xl font-bold text-[#0b0b2c]">
            {editingId ? "Edit Event" : "Create New Event"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Event Title *"
              value={formData.title}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location (e.g., Online via Zoom)"
              value={formData.location}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="url"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="url"
            name="zoom_link"
            placeholder="Zoom Meeting Link"
            value={formData.zoom_link}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
            />
            <input
              type="number"
              name="registered"
              placeholder="Currently Registered"
              value={formData.registered}
              onChange={handleInputChange}
              className="px-4 py-2 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="w-4 h-4 border border-slate-200 rounded"
            />
            <span className="text-sm font-medium text-[#0b0b2c]">
              Publish this event (visible on website)
            </span>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-[8px] hover:bg-[#2a2ad6] transition-colors"
            >
              {editingId ? "Update Event" : "Create Event"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-200 text-[#0b0b2c] px-6 py-2 rounded-[8px] hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-8 text-[#69697b]">
            No events yet. Create your first event!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-[#0b0b2c]">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-[#0b0b2c]">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-[#0b0b2c]">
                    Registered
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-[#0b0b2c]">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-[#0b0b2c]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#0b0b2c]">
                          {event.title}
                        </p>
                        <p className="text-sm text-[#69697b]">
                          {event.zoom_link && (
                            <a
                              href={event.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Zoom Link
                            </a>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#0b0b2c]">
                      <p className="text-sm font-medium">{event.date}</p>
                      <p className="text-sm text-[#69697b]">{event.time}</p>
                    </td>
                    <td className="px-6 py-4 text-[#0b0b2c]">
                      <p className="text-sm">
                        {event.registered} / {event.capacity}
                      </p>
                      <div className="mt-1 w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${(event.registered / event.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          event.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {event.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePublish(event)}
                          className="p-2 text-[#69697b] hover:text-primary transition-colors"
                          title={
                            event.published ? "Unpublish" : "Publish"
                          }
                        >
                          {event.published ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-[#69697b] hover:text-primary transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-[#69697b] hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
