"use client";

import React, { useState } from "react";
import { X, Sliders, Youtube, Plus, Trash2, Check } from "lucide-react";
import { ChannelTemplate } from "@/lib/types";

interface ChannelTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ChannelTemplate;
  onSaveTemplate: (template: ChannelTemplate) => void;
}

export default function ChannelTemplateModal({
  isOpen,
  onClose,
  template,
  onSaveTemplate,
}: ChannelTemplateModalProps) {
  const [form, setForm] = useState<ChannelTemplate>(template);
  const [newPillar, setNewPillar] = useState("");
  const [newTag, setNewTag] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddPillar = () => {
    if (!newPillar.trim()) return;
    setForm((prev) => ({
      ...prev,
      contentPillars: [...prev.contentPillars, newPillar.trim()],
    }));
    setNewPillar("");
  };

  const handleRemovePillar = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contentPillars: prev.contentPillars.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setForm((prev) => ({
      ...prev,
      defaultTags: [...prev.defaultTags, newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      defaultTags: prev.defaultTags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTemplate(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">YouTube Channel Template</h3>
              <p className="text-xs text-gray-500">Configure your channel brand, voice & defaults</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Channel Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Tone of Voice
              </label>
              <input
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="e.g. Punchy, high-energy, educational"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Target Channel Niche
            </label>
            <input
              type="text"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Standard Outro / Description CTA
            </label>
            <textarea
              value={form.defaultOutro}
              onChange={(e) => setForm({ ...form, defaultOutro: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 outline-none resize-none font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Default Social / Repository Links
            </label>
            <input
              type="text"
              value={form.socialLinks}
              onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Content Pillars */}
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Content Pillars (Categories)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.contentPillars.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md border border-gray-300 text-[11px]"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => handleRemovePillar(idx)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                placeholder="Add new pillar..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 border border-gray-300"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Default Tags */}
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Default Channel Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.defaultTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 text-[11px]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-red-400 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g. coding)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 border border-gray-300"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm flex items-center gap-1"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Template</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
