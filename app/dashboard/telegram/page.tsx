"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TelegramSettingsPage() {
  const [imageBotToken, setImageBotToken] = useState("");
  const [imageChannelId, setImageChannelId] = useState("");

  const [videoBotToken, setVideoBotToken] = useState("");
  const [videoChannelId, setVideoChannelId] = useState("");

  const [audioBotToken, setAudioBotToken] = useState("");
  const [audioChannelId, setAudioChannelId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/telegram-config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setImageBotToken(data.imageBotToken || data.botToken || "");
          setImageChannelId(data.imageChannelId || data.channelId || "");
          setVideoBotToken(data.videoBotToken || data.botToken || "");
          setVideoChannelId(data.videoChannelId || data.channelId || "");
          setAudioBotToken(data.audioBotToken || data.botToken || "");
          setAudioChannelId(data.audioChannelId || data.channelId || "");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load Telegram configuration");
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/telegram-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBotToken,
          imageChannelId,
          videoBotToken,
          videoChannelId,
          audioBotToken,
          audioChannelId,
        }),
      });

      if (res.ok) {
        toast.success("Telegram configurations saved successfully!");
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    setImageBotToken("");
    setImageChannelId("");
    setVideoBotToken("");
    setVideoChannelId("");
    setAudioBotToken("");
    setAudioChannelId("");
  }

  if (loading) {
    return <div className="text-sm text-[#555]">Loading Telegram settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Telegram ID & Bot Settings</h1>
        <p className="text-sm text-[#555] mt-1">
          Configure separate Telegram Bot Tokens and Group/Channel IDs for Images, Videos, and Audio. If any section is left empty, uploads for that media type will show a warning/error.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Images Section */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <span>🖼️</span> Images Telegram Bot & Group ID
            {!imageBotToken || !imageChannelId ? (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Not configured (will warn on upload)
              </span>
            ) : (
              <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Configured ✓
              </span>
            )}
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Bot Token</label>
            <input
              type="text"
              value={imageBotToken}
              onChange={(e) => setImageBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdef..."
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group / Channel ID</label>
            <input
              type="text"
              value={imageChannelId}
              onChange={(e) => setImageChannelId(e.target.value)}
              placeholder="e.g. -1001234567890"
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <span>🎥</span> Videos Telegram Bot & Group ID
            {!videoBotToken || !videoChannelId ? (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Not configured (will warn on upload)
              </span>
            ) : (
              <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Configured ✓
              </span>
            )}
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Bot Token</label>
            <input
              type="text"
              value={videoBotToken}
              onChange={(e) => setVideoBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdef..."
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group / Channel ID</label>
            <input
              type="text"
              value={videoChannelId}
              onChange={(e) => setVideoChannelId(e.target.value)}
              placeholder="e.g. -1001234567890"
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
        </div>

        {/* Audio Section */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <span>🎵</span> Audio Telegram Bot & Group ID
            {!audioBotToken || !audioChannelId ? (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Not configured (will warn on upload)
              </span>
            ) : (
              <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded ml-auto font-normal">
                Configured ✓
              </span>
            )}
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Bot Token</label>
            <input
              type="text"
              value={audioBotToken}
              onChange={(e) => setAudioBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdef..."
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group / Channel ID</label>
            <input
              type="text"
              value={audioChannelId}
              onChange={(e) => setAudioChannelId(e.target.value)}
              placeholder="e.g. -1001234567890"
              className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All Fields
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configurations"}
          </button>
        </div>
      </form>
    </div>
  );
}
