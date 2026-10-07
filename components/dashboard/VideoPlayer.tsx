'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Copy, Download, X, CheckCircle2,
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2
} from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  fileName: string
  fileSizeMb?: number
  createdAt?: string
  slug?: string
}

export default function VideoPlayer({ isOpen, onClose, videoUrl, fileName, fileSizeMb, createdAt, slug }: Props) {
  const [copied, setCopied] = useState(false)

  // Custom Player States
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isBuffering, setIsBuffering] = useState(true) // Start with loading state
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // Persisted States using localStorage
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('videoPlayer_volume')
      return saved ? Number(saved) : 1
    }
    return 1
  })

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('videoPlayer_isMuted') === 'true'
    }
    return false
  })

  const [playbackRate, setPlaybackRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('videoPlayer_playbackRate')
      return saved ? Number(saved) : 1
    }
    return 1
  })

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Apply persisted settings when video loads or source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
      videoRef.current.muted = isMuted
      videoRef.current.playbackRate = playbackRate

      videoRef.current.play().catch(() => {
        setIsPlaying(false)
        setIsBuffering(false) // If auto-play is blocked, stop loading spinner
      })
    }
  }, [videoUrl, isMuted, volume, playbackRate])

  if (!isOpen) return null

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const m = Math.floor(time / 60).toString().padStart(2, '0')
    const s = Math.floor(time % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu) setShowControls(false)
    }, 2500)
  }

  const handleMouseLeave = () => {
    if (isPlaying && !showSpeedMenu) setShowControls(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowControls(true)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const dur = videoRef.current.duration || 0
    setCurrentTime(current)
    setProgress((current / dur) * 100 || 0)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    // Ensure settings are applied as soon as metadata is ready
    videoRef.current.volume = isMuted ? 0 : volume
    videoRef.current.muted = isMuted
    videoRef.current.playbackRate = playbackRate
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const manualChange = Number(e.target.value)
    const time = (manualChange / 100) * duration
    videoRef.current.currentTime = time
    setProgress(manualChange)
    setCurrentTime(time)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMutedState = !isMuted
    videoRef.current.muted = newMutedState
    setIsMuted(newMutedState)
    localStorage.setItem('videoPlayer_isMuted', String(newMutedState))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const newVol = Number(e.target.value)
    videoRef.current.volume = newVol
    setVolume(newVol)
    localStorage.setItem('videoPlayer_volume', String(newVol))

    if (newVol === 0) {
      setIsMuted(true)
      localStorage.setItem('videoPlayer_isMuted', 'true')
    } else {
      setIsMuted(false)
      localStorage.setItem('videoPlayer_isMuted', 'false')
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = speed
    setPlaybackRate(speed)
    localStorage.setItem('videoPlayer_playbackRate', String(speed))
    setShowSpeedMenu(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(videoUrl)
    setCopied(true)
    toast.success('Video URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200 select-none"
    >
      {/* Top Header - Fixed Height */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-[72px] shrink-0 w-full flex items-center justify-between text-white px-4 sm:px-6 border-b border-white/10 bg-black/20 z-20"
      >
        <div>
          <h2 className="text-sm font-medium truncate max-w-[200px] sm:max-w-xl">{fileName}</h2>
          <p className="text-[11px] text-[#888] mt-0.5">
            {fileSizeMb ? `${fileSizeMb} MB` : ''} {createdAt ? `• ${new Date(createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Video Area - Strict Boundaries (No Cropping) */}
      <div
        ref={containerRef}
        onClick={(e) => {
           e.stopPropagation()
           if (showSpeedMenu) setShowSpeedMenu(false)
           else togglePlay()
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 min-h-0 relative w-full flex items-center justify-center bg-black z-10 overflow-hidden"
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onDoubleClick={toggleFullscreen}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          className="w-full h-full object-contain"
        />

        {/* Buffering Loading Spinner Overlay */}
        {isBuffering ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-all duration-300 z-10">
            <div className="bg-black/50 p-4 rounded-2xl backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          </div>
        ) : !isPlaying && !showSpeedMenu ? (
          /* Big Play Button Overlay (when paused and NOT buffering) */
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none transition-all duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-2xl scale-105">
              <Play className="w-6 h-6 ml-1 fill-current" />
            </div>
          </div>
        ) : null}

        {/* Custom Controls Bottom Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-4 sm:px-6 transition-opacity duration-300 ${
            showControls || showSpeedMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar */}
          <div className="flex items-center gap-3 w-full mb-3 group/seek cursor-pointer">
            <span className="text-[11px] font-mono text-white/90">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 appearance-none bg-white/20 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100 transition-all hover:h-2"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
              }}
            />
            <span className="text-[11px] font-mono text-white/50">{formatTime(duration)}</span>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 transition-all duration-300 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  style={{
                    background: `linear-gradient(to right, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Playback Speed Menu Button */}
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                title="Playback Speed"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[10px] font-mono font-medium">{playbackRate}x</span>
              </button>

              {/* Speed Dropdown Menu */}
              {showSpeedMenu && (
                <div className="absolute bottom-full right-8 mb-4 bg-[#161616] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-medium text-[#888] px-3 py-1.5 border-b border-white/5 bg-white/5 uppercase">
                    Playback Speed
                  </div>
                  <div className="flex flex-col py-1">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`text-xs px-6 py-2 text-left hover:bg-white/10 transition-colors ${
                          playbackRate === speed ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white'
                        }`}
                      >
                        {speed === 1 ? 'Normal' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed Height */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-[72px] shrink-0 w-full flex items-center justify-end gap-3 px-4 sm:px-6 border-t border-white/10 bg-black/20 z-20"
      >
        <button
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 backdrop-blur-md"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a
          href={`${videoUrl}?download=true`}
          download
          className="bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Download
        </a>
      </div>
    </div>
  )
}
