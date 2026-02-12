import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, Search, Home, Library, Heart, 
  MoreHorizontal, Plus, Clock, Layers,
  CheckCircle, Mic2, LayoutList, MonitorSpeaker,
  Maximize2, ArrowRight, Sparkles, TrendingUp, ChevronUp
} from 'lucide-react';

const TRACKS = [
  { 
    id: 1, 
    title: "Midnight City", 
    artist: "M83", 
    album: "Hurry Up, We're Dreaming", 
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#4f46e5",
    duration: 372
  },
  { 
    id: 2, 
    title: "After Hours", 
    artist: "The Weeknd", 
    album: "After Hours", 
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&h=400&auto=format&fit=crop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#e11d48",
    duration: 425
  },
  { 
    id: 3, 
    title: "Lost in Yesterday", 
    artist: "Tame Impala", 
    album: "The Slow Rush", 
    cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=400&h=400&auto=format&fit=crop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#10b981",
    duration: 310
  },
  { 
    id: 4, 
    title: "Levitating", 
    artist: "Dua Lipa", 
    album: "Future Nostalgia", 
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&h=400&auto=format&fit=crop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    color: "#a855f7",
    duration: 203
  }
];

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-sm font-semibold transition-all duration-300 ${active ? 'bg-white/[0.08] text-white shadow-xl border border-white/5' : 'text-white/20 hover:text-white/60'}`}>
    {React.cloneElement(icon, { size: 18 })} {label}
  </button>
);

const TrackRow = ({ track, index, active, isPlaying, onClick }) => (
  <div onClick={onClick} className={`group flex items-center gap-6 px-6 py-4 rounded-[32px] transition-all duration-500 cursor-pointer ${active ? 'bg-white/[0.08] border border-white/10' : 'hover:bg-white/[0.03] border border-transparent'}`}>
    <div className="w-6 flex justify-center items-center">
      {isPlaying ? (
        <div className="flex items-end gap-1 h-3">
          <div className="w-[3px] bg-white animate-bounce" />
          <div className="w-[3px] bg-white animate-bounce [animation-delay:0.2s]" />
          <div className="w-[3px] bg-white animate-bounce [animation-delay:0.4s]" />
        </div>
      ) : (
        <span className={`text-[10px] font-black font-mono transition-colors ${active ? 'text-white' : 'text-white/10 group-hover:text-white/40'}`}>
          {index.toString().padStart(2, '0')}
        </span>
      )}
    </div>
    
    <div className="relative">
      <img src={track.cover} className="w-14 h-14 rounded-2xl object-cover shadow-2xl group-hover:scale-110 transition-transform" alt="" />
      {active && <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-[2px] flex items-center justify-center animate-pulse" />}
    </div>

    <div className="flex-1 min-w-0">
      <p className={`text-base font-bold truncate ${active ? 'text-white' : 'text-white/60'}`}>{track.title}</p>
      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">{track.artist}</p>
    </div>

    <div className="hidden lg:block w-48 text-xs font-bold text-white/10 truncate">{track.album}</div>

    <div className="flex items-center gap-6">
      <Heart className={`w-4 h-4 transition-all ${active ? 'text-red-500 fill-red-500' : 'text-white/10 group-hover:text-white/30 hover:text-red-500'}`} />
      <span className="text-[10px] font-mono text-white/20 font-black">
        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
      </span>
    </div>
  </div>
);

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [activeTab, setActiveTab] = useState('home');
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    audioRef.current = new Audio(TRACKS[0].url);
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => skipTrack(1);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => { 
    if (audioRef.current) audioRef.current.volume = volume; 
  }, [volume]);

  const playTrack = async () => {
    try {
      if (audioRef.current.readyState < 2) {
        await new Promise((resolve) => {
          audioRef.current.addEventListener('canplay', resolve, { once: true });
        });
      }
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    setHasInteracted(true);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playTrack();
    }
  };

  const skipTrack = (dir) => {
    setHasInteracted(true);
    let newIndex = currentTrackIndex + dir;
    if (newIndex < 0) newIndex = TRACKS.length - 1;
    if (newIndex >= TRACKS.length) newIndex = 0;
    
    audioRef.current.src = TRACKS[newIndex].url;
    audioRef.current.load();
    setCurrentTrackIndex(newIndex);
    
    if (isPlaying || hasInteracted) {
      playTrack();
    }
  };

  const handleSeek = (val) => {
    const time = (val / 100) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden flex flex-col lg:flex-row font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[80%] h-[80%] rounded-full blur-[140px] opacity-20 transition-all duration-1000"
          style={{ background: currentTrack.color }}
        />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen p-6 flex-col z-50 border-r border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white to-white/40 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">Lumina</span>
        </div>
        <nav className="flex flex-col gap-2">
          <SidebarLink icon={<Home />} label="Discover" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarLink icon={<TrendingUp />} label="Trending" active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} />
          <SidebarLink icon={<Library />} label="My Vault" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
        </nav>
        <div className="mt-auto p-5 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
          <p className="text-sm font-semibold mb-1">Lossless Audio</p>
          <p className="text-[10px] text-white/40 mb-4 uppercase tracking-widest">Active Plan</p>
          <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-xl">Manage</button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar z-10">
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 py-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 hover:bg-white/10 transition-all backdrop-blur-md">
            <Search className="w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search universe..." className="bg-transparent border-none outline-none text-sm w-40 lg:w-64" />
          </div>
          <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full border border-white/20 hover:scale-110 transition-transform" alt="user" />
        </header>

        {/* Cinematic Hero Section */}
        <div className="px-6 lg:px-12 py-4">
          <div className="relative group overflow-hidden rounded-[56px] h-[50vh] lg:h-[65vh] bg-neutral-900 border border-white/10 shadow-3xl">
            <img src={currentTrack.cover} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%] group-hover:scale-105 transition-transform duration-[5s] ease-out" alt="artist" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            
            <div className="absolute inset-0 p-8 lg:p-16 flex flex-col justify-end">
              <div className="flex items-center gap-4 mb-4">
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-blue-400 ${isPlaying ? 'animate-pulse' : ''} shadow-[0_0_8px_rgba(96,165,250,0.8)]`} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Now Streaming</span>
                </div>
              </div>
              
              <h1 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-4 pointer-events-none drop-shadow-2xl">
                {currentTrack.artist}
              </h1>
              
              <div className="flex items-center gap-6">
                 <div className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">{currentTrack.title} • {currentTrack.album}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-12 py-12 space-y-20">
          
          {/* VIBE QUEUE */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <LayoutList className="text-white/20" /> The Vibe Queue
              </h2>
              <div className="h-[1px] flex-1 mx-8 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {TRACKS.map((track, i) => (
                <TrackRow 
                  key={track.id} 
                  track={track} 
                  index={i+1} 
                  active={currentTrackIndex === i} 
                  isPlaying={isPlaying && currentTrackIndex === i} 
                  onClick={() => { 
                    setHasInteracted(true);
                    if(currentTrackIndex === i) togglePlay(); 
                    else { 
                      audioRef.current.src = track.url; 
                      audioRef.current.load();
                      setCurrentTrackIndex(i); 
                      playTrack();
                    } 
                  }} 
                />
              ))}
            </div>
          </section>

          {/* LYRICS SECTION */}
          <section className="space-y-8">
             <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Mic2 className="text-white/20" /> Live Canvas
              </h2>
              <div className="h-[1px] flex-1 mx-8 bg-white/5" />
            </div>
             <div className="max-w-4xl space-y-6 text-4xl lg:text-6xl font-black tracking-tighter">
                <p className={`transition-all duration-700 ${isPlaying ? 'text-white opacity-100' : 'text-white/40'}`}>I'm staring at the midnight city</p>
                <p className="text-white/10 hover:text-white/40 transition-all duration-700 cursor-default">And the lights are shining down</p>
                <p className="text-white/10 hover:text-white/40 transition-all duration-700 cursor-default">Waiting for the sun to rise</p>
             </div>
          </section>

          {/* RECOMMENDED SECTION */}
          <section className="space-y-8 pb-48">
             <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Sparkles className="text-white/20" /> Curated for You
              </h2>
              <div className="h-[1px] flex-1 mx-8 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="group cursor-pointer space-y-4">
                  <div className="aspect-square rounded-[32px] overflow-hidden bg-neutral-900 border border-white/5 group-hover:border-white/20 transition-all duration-500">
                    <img src={`https://picsum.photos/seed/${i+100}/400/400`} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" alt="" />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">Sonic Flow Vol. {i}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Album • Lumina AI</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* PLAYER BAR */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-[100] group/player">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/player:opacity-40 transition-opacity">
           <ChevronUp className="w-4 h-4 animate-bounce" />
        </div>

        <div className="relative p-4 lg:p-5 rounded-[40px] bg-white/[0.03] backdrop-blur-[50px] border border-white/[0.1] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.06] hover:border-white/20">
          
          <div className="absolute top-0 left-0 w-full h-[3px] bg-white/[0.05] overflow-hidden rounded-full">
            <div 
              className="h-full transition-all duration-300 relative shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
              style={{ width: `${(currentTime / duration) * 100 || 0}%`, background: `linear-gradient(90deg, transparent, ${currentTrack.color}, white)` }}
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 w-[30%]">
              <img src={currentTrack.cover} className={`w-12 h-12 rounded-2xl object-cover shadow-2xl transition-all ${isPlaying ? 'rotate-[10deg]' : ''}`} alt="cover" />
              <div className="hidden sm:block min-w-0">
                <h4 className="font-bold text-xs lg:text-sm truncate tracking-tight">{currentTrack.title}</h4>
                <p className="text-[9px] text-white/40 truncate tracking-widest font-black uppercase">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 lg:gap-10">
              <Shuffle className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
              <SkipBack className="w-6 h-6 text-white/60 hover:text-white cursor-pointer active:scale-75 transition-all" onClick={() => skipTrack(-1)} />
              
              <button 
                onClick={togglePlay}
                className="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause size={24} fill="black" className="text-black" /> : <Play size={24} fill="black" className="text-black ml-1" />}
              </button>

              <SkipForward className="w-6 h-6 text-white/60 hover:text-white cursor-pointer active:scale-75 transition-all" onClick={() => skipTrack(1)} />
              <Repeat className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
            </div>

            <div className="flex items-center justify-end gap-5 w-[30%] pr-2">
              <Volume2 className="hidden lg:block w-4 h-4 text-white/20" />
              <div className="hidden lg:block w-16 h-[2px] bg-white/10 rounded-full relative cursor-pointer">
                 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                 <div className="h-full bg-white/40 rounded-full" style={{ width: `${volume * 100}%` }} />
              </div>
              <Maximize2 className="w-4 h-4 text-white/20 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        input[type='range'] { -webkit-appearance: none; background: transparent; }
      ` }} />
    </div>
  );
};

export default App;