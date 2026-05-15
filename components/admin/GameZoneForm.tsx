"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GameZone, gameZoneApi } from "@/apis/game-zone";
import { ImagePicker } from "@/components/form/image-picker";
import { Gamepad2, Save, ArrowLeft, Loader2, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

interface GameZoneFormProps {
  id?: string;
  initialData?: GameZone;
}

export default function GameZoneForm({ id, initialData }: GameZoneFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "spin_the_wheel",
    level: "normal",
    responseMode: "single_response",
    systemPrompt: "",
    userPromptTemplate: "Тоглогч: {{playerName}}",
    model: "",
    isActive: true,
    sortOrder: 0,
    imageId: "",
    imageUrl: "",
  });

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "spin_the_wheel",
        level: initialData.level || "normal",
        responseMode: initialData.responseMode || "single_response",
        systemPrompt: initialData.systemPrompt || "",
        userPromptTemplate: initialData.userPromptTemplate || "Тоглогч: {{playerName}}",
        model: initialData.model || "",
        isActive: initialData.isActive ?? true,
        sortOrder: initialData.sortOrder || 0,
        imageId: initialData.image?._id || "",
        imageUrl: initialData.image?.url || "",
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder.toString()),
    };

    try {
      if (id) {
        await gameZoneApi.updateGameZone(id, payload);
        toast.success("GameZone updated successfully");
      } else {
        await gameZoneApi.createGameZone(payload);
        toast.success("GameZone created successfully");
        router.push("/admin/game-zone");
      }
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/game-zone"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {id ? "Edit GameZone" : "Create New GameZone"}
            </h1>
            <p className="text-sm text-gray-500">
              {id ? "Modify game zone details" : "Configure a new game zone"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{id ? "Save Changes" : "Create GameZone"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image & Status */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Visuals
            </h3>

            <ImagePicker
              label="Game Image"
              value={{ id: formData.imageId, url: formData.imageUrl }}
              onChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  imageId: v?.id || "",
                  imageUrl: v?.url || "",
                }))
              }
            />

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-blue-500" />
              Game Configuration
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <input
                required
                type="text"
                name="title"
                placeholder="e.g. Spin the Wheel"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea
                name="description"
                placeholder="Brief description of the game..."
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                <input
                  required
                  type="text"
                  name="type"
                  placeholder="e.g. spin_the_wheel"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">AI Model</label>
                <input
                  required
                  type="text"
                  name="model"
                  placeholder="e.g. gpt-4o"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Response Mode</label>
                <select
                  name="responseMode"
                  value={formData.responseMode}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="single_response">Single Response</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                User Prompt Template
              </label>
              <input
                type="text"
                name="userPromptTemplate"
                placeholder="Тоглогч: {{playerName}}"
                value={formData.userPromptTemplate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">System Prompt</label>
              <textarea
                required
                name="systemPrompt"
                placeholder="Game rules and instructions for the AI..."
                rows={10}
                value={formData.systemPrompt}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
