'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Copy, Download, X, CheckCircle2,
  Play, Pause, Volume2, VolumeX, Settings
} from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  audioUrl: string
  fileName: string
  fileSizeMb?: number
  createdAt?: string
  slug?: string
}

export default function AudioPlayer({ isOpen, onClose, audioUrl, fileName, fileSizeMb, createdAt, slug }: Props) {
  const [copied, setCopied] = useState(false)

  // Custom Player States
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // Persisted States using localStorage
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioPlayer_volume')
      return saved ? Number(saved) : 1
    }
    return 1
  })

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('audioPlayer_isMuted') === 'true'
    }
    return false
  })

  const [playbackRate, setPlaybackRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioPlayer_playbackRate')
      return saved ? Number(saved) : 1
    }
    return 1
  })

  const [hasTrackedView, setHasTrackedView] = useState(false)

  const trackView = async () => {
    if (hasTrackedView || !slug) return
    try {
      setHasTrackedView(true)
      await fetch(`/api/views/${slug}`, { method: 'POST' })
    } catch (e) {
      console.error('Failed to track view', e)
    }
  }

  // Audio Visualizer Setup
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return

    // Audio Context is only created upon user interaction to comply with browser autoplay policies
    const setupAudioContext = () => {
      if (!audioCtxRef.current && audioRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioContext()
        analyzerRef.current = audioCtxRef.current.createAnalyser()

        // Connect the audio element to the analyzer
        sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current)
        sourceRef.current.connect(analyzerRef.current)
        analyzerRef.current.connect(audioCtxRef.current.destination)

        analyzerRef.current.fftSize = 64 // Use a smaller FFT size for fewer, thicker bars
      }

      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume()
      }
    }

    const drawVisualizer = () => {
      if (!canvasRef.current || !analyzerRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const bufferLength = analyzerRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      analyzerRef.current.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 1.5
      let x = 0

      // Calculate a dynamic center point based on average frequency
      const avgFreq = dataArray.reduce((a, b) => a + b, 0) / bufferLength
      const intensity = avgFreq / 255

      // Draw Bars
      for (let i = 0; i < bufferLength; i++) {
        // Only use the lower half of frequencies for visualizer (usually where the beat is)
        if (i > bufferLength * 0.7) continue

        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.4 + intensity * 0.3})`) // Purple base
        gradient.addColorStop(1, `rgba(192, 132, 252, ${0.6 + intensity * 0.4})`) // Lighter purple top

        ctx.fillStyle = gradient

        // Draw rounded bars
        const radius = barWidth / 2
        ctx.beginPath()
        ctx.moveTo(x, canvas.height)
        ctx.lineTo(x, canvas.height - barHeight + radius)
        ctx.arcTo(x, canvas.height - barHeight, x + radius, canvas.height - barHeight, radius)
        ctx.arcTo(x + barWidth, canvas.height - barHeight, x + barWidth, canvas.height - barHeight + radius, radius)
        ctx.lineTo(x + barWidth, canvas.height)
        ctx.fill()

        x += barWidth + 2 // Add some gap
      }

      // Add subtle glow effect to whole canvas based on music intensity
      canvas.style.filter = `drop-shadow(0 0 ${10 + intensity * 30}px rgba(168, 85, 247, ${0.2 + intensity * 0.3}))`

      animationRef.current = requestAnimationFrame(drawVisualizer)
    }

    const handlePlayEvent = () => {
      setupAudioContext()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      drawVisualizer()
      trackView()
    }

    const handlePauseEvent = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      // Draw a flat line when paused
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
           ctx.clearRect(0, 0, canvas.width, canvas.height)
           ctx.fillStyle = 'rgba(168, 85, 247, 0.3)'
           ctx.fillRect(0, canvas.height - 4, canvas.width, 4)
           canvas.style.filter = 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.1))'
        }
      }
    }

    const el = audioRef.current
    el.addEventListener('play', handlePlayEvent)
    el.addEventListener('pause', handlePauseEvent)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      el.removeEventListener('play', handlePlayEvent)
      el.removeEventListener('pause', handlePauseEvent)
    }
  }, [audioUrl])

  // Apply persisted settings when audio loads
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.muted = isMuted
      audioRef.current.playbackRate = playbackRate

      // We don't auto-play to allow AudioContext to attach correctly upon user interaction,
      // but if the user wants it, we can attempt it (browsers often block it without prior interaction)
      // Let's attempt auto-play, if it fails, the user will have to click play
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    }
  }, [audioUrl])

  if (!isOpen) return null

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const m = Math.floor(time / 60).toString().padStart(2, '0')
    const s = Math.floor(time % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    // Ensure context is resumed if user interacts
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
         setIsPlaying(true)
      }).catch((e) => {
         console.error("Playback failed:", e)
      })
    }
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const dur = audioRef.current.duration || 0
    setCurrentTime(current)
    setProgress((current / dur) * 100 || 0)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
    audioRef.current.volume = isMuted ? 0 : volume
    audioRef.current.muted = isMuted
    audioRef.current.playbackRate = playbackRate
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const manualChange = Number(e.target.value)
    const time = (manualChange / 100) * duration
    audioRef.current.currentTime = time
    setProgress(manualChange)
    setCurrentTime(time)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMutedState = !isMuted
    audioRef.current.muted = newMutedState
    setIsMuted(newMutedState)
    localStorage.setItem('audioPlayer_isMuted', String(newMutedState))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const newVol = Number(e.target.value)
    audioRef.current.volume = newVol
    setVolume(newVol)
    localStorage.setItem('audioPlayer_volume', String(newVol))

    if (newVol === 0) {
      setIsMuted(true)
      localStorage.setItem('audioPlayer_isMuted', 'true')
    } else {
      setIsMuted(false)
      localStorage.setItem('audioPlayer_isMuted', 'false')
    }
  }

  const handleSpeedChange = (speed: number) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = speed
    setPlaybackRate(speed)
    localStorage.setItem('audioPlayer_playbackRate', String(speed))
    setShowSpeedMenu(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(audioUrl)
    setCopied(true)
    toast.success('Audio URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-xl bg-[#111] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#161616]/50">
          <h2 className="text-sm font-semibold text-white tracking-wide truncate pr-4 uppercase text-[#a855f7]">Now Playing</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#888] hover:text-white transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Visualizer & Info */}
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-b from-[#1a1a1a] via-[#111] to-[#0a0a0a] relative overflow-hidden">

          {/* Ambient Background Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}></div>

          {/* Dynamic Audio Visualizer Canvas */}
          <div className="relative w-64 h-32 mb-8 flex items-end justify-center">
            <canvas
              ref={canvasRef}
              width={256}
              height={128}
              className="w-full h-full"
            />
            {/* Fallback flat line before playback starts */}
            {!isPlaying && progress === 0 && (
              <div className="absolute bottom-0 w-full h-1 bg-purple-500/30 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.1)]"></div>
            )}
          </div>

          <h3 className="text-lg font-bold text-white text-center truncate w-full max-w-[90%] mb-2 z-10 drop-shadow-md">
            {fileName}
          </h3>
          <p className="text-xs font-mono text-[#777] text-center z-10 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {fileSizeMb ? `${fileSizeMb} MB` : 'Audio'} • {createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown Date'}
          </p>
        </div>

        {/* Audio Element (Hidden) - crossOrigin must be set to anonymous for AudioContext analyzer to work with external URLs */}
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Controls Section */}
        <div className="px-6 pb-8 pt-4 bg-[#0a0a0a] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          {/* Seek Bar */}
          <div className="flex items-center gap-4 w-full mb-6 group/seek cursor-pointer">
            <span className="text-xs font-mono text-[#888] w-10 text-right shrink-0">{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center h-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute w-full h-1.5 appearance-none bg-white/10 rounded-full outline-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.5)] [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100 transition-all hover:h-2"
                style={{
                  background: `linear-gradient(to right, #a855f7 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
                }}
              />
            </div>
            <span className="text-xs font-mono text-[#555] w-10 shrink-0">{formatTime(duration)}</span>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls (Volume) */}
            <div className="flex items-center gap-2 group/volume w-24 sm:w-32">
              <button onClick={toggleMute} className="text-[#888] hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-20 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>

            {/* Play/Pause Button (Center) */}
            <button
              onClick={togglePlay}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105 ${
                isPlaying ? 'bg-white text-black' : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-current" />}
            </button>

            {/* Right Tools (Speed, Copy, Download) */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 relative w-24 sm:w-32">
              {/* Speed Menu */}
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-[#888] hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg"
                title="Playback Speed"
              >
                <Settings className="w-3.5 h-3.5 hidden sm:block" />
                <span className="text-[10px] font-mono font-medium">{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-4 w-32 bg-[#161616] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="text-[10px] font-medium text-[#777] px-3 py-2 border-b border-white/5 uppercase tracking-wider bg-black/40">
                    Speed
                  </div>
                  <div className="flex flex-col py-1">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`text-xs px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                          playbackRate === speed ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-white'
                        }`}
                      >
                        {speed === 1 ? 'Normal' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCopy}
                className="text-[#888] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                title="Copy Link"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={`${audioUrl}?download=true`}
                download
                className="text-white transition-colors bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 p-2 rounded-lg"
                title="Download Audio"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
