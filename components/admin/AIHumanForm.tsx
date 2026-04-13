"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { aiHumanApi } from "@/apis";
import { AIHuman } from "@/apis/ai-human";
import { ImagePicker } from "@/components/form/image-picker";
import { Bot, Save, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface AIHumanFormProps {
  id?: string;
  initialData?: AIHuman;
}

export default function AIHumanForm({ id, initialData }: AIHumanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "other",
    shortBio: "",
    prompt: "",
    greeting: "",
    model: "",
    isActive: true,
    sortOrder: 0,
    imageId: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        age: initialData.age?.toString() || "",
        gender: initialData.gender || "other",
        shortBio: initialData.shortBio || "",
        prompt: initialData.prompt || "",
        greeting: initialData.greeting || "",
        model: initialData.aiModel || "",
        isActive: initialData.isActive ?? true,
        sortOrder: initialData.sortOrder || 0,
        imageId: initialData.image?._id || initialData.image?.id || "",
        imageUrl: initialData.image?.url || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      sortOrder: parseInt(formData.sortOrder.toString()),
    };

    try {
      if (id) {
        await aiHumanApi.updateAIHuman(id, payload);
        toast.success("AI Human updated successfully");
      } else {
        await aiHumanApi.createAIHuman(payload);
        toast.success("AI Human created successfully");
        router.push("/admin/ai-human");
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
            href="/admin/ai-human"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {id ? "Edit AI Human" : "Create New AI Human"}
            </h1>
            <p className="text-sm text-gray-500">
              {id ? "Modify persona details" : "Configure a new AI agent"}
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
          <span>{id ? "Save Changes" : "Create Persona"}</span>
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
              label="Persona Avatar"
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
              <Bot className="w-4 h-4 text-blue-500" />
              Core Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Sarah AI"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">AI Model</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. gpt-4o"
                value={formData.model}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Short Bio</label>
              <textarea
                required
                name="shortBio"
                placeholder="A brief description of the persona..."
                rows={2}
                value={formData.shortBio}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Greeting Message</label>
              <textarea
                name="greeting"
                placeholder="Initial message sent by the AI..."
                rows={2}
                value={formData.greeting}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">System Prompt (The Brain)</label>
              <textarea
                required
                name="prompt"
                placeholder="Define the behavior, personality, and knowledge limits of this AI..."
                rows={10}
                value={formData.prompt}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-[10px] text-gray-500 italic">This is the hidden soul of the AI. Be descriptive and consistent.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
