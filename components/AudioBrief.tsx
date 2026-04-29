
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Loader2, X, Music } from 'lucide-react';
import { generateAudioBrief } from '../services/geminiService';

// Fix: Decoding and playing raw PCM audio from Gemini API
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AudioBriefProps {
  summary: string;
}

const AudioBrief: React.FC<AudioBriefProps> = ({ summary }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopPlayback = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (isLoading) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsLoading(true);
    try {
      const base64Audio = await generateAudioBrief(summary);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioData = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          audioSourceRef.current = null;
        };
        
        audioSourceRef.current = source;
        source.start(0);
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-float">
      <button 
        onClick={togglePlayback}
        className={`group relative flex items-center gap-3 p-4 rounded-2xl glass-card luxury-shadow glow-blue transition-all active:scale-95 ${
          isPlaying ? 'bg-blue-600 border-blue-400' : 'hover:bg-slate-800'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          isPlaying ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-lg'
        }`}>
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 
           isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </div>
        <div className="text-left pr-4">
          <p className={`text-[10px] font-black uppercase tracking-widest ${isPlaying ? 'text-blue-100' : 'text-blue-400'}`}>
            {isLoading ? 'Generating Brief...' : isPlaying ? 'Now Playing' : 'Voice Briefing'}
          </p>
          <p className="text-sm font-bold text-white">CEO Audio Summary</p>
        </div>
        {isPlaying && (
          <div className="absolute -top-1 -right-1 flex gap-0.5">
             {[1,2,3].map(i => (
               <div key={i} className="w-1 bg-white animate-pulse" style={{ height: '8px', animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
        )}
      </button>
    </div>
  );
};

export default AudioBrief;
