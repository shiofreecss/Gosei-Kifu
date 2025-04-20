import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

interface Music {
  title: string;
  file: string;
}

const MusicPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Music playlist - the files should be in public/music folder
  const playlist: Music[] = [
    { title: "Relaxing Zen Music 1", file: "/music/zen-music-1.mp3" },
    { title: "Relaxing Zen Music 2", file: "/music/zen-music-2.mp3" },
    { title: "Traditional Go Music", file: "/music/traditional-go.mp3" }
  ];
  
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(playlist[currentTrack].file);
    audioRef.current.volume = volume;
    
    // Add event listeners
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [currentTrack]);
  
  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Play/pause when isPlaying state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Handle track end - play next track
  const handleTrackEnd = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };
  
  // Play specific track
  const playTrack = (index: number) => {
    if (currentTrack === index && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(index);
      setIsPlaying(true);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Play next track
  const nextTrack = () => {
    const next = (currentTrack + 1) % playlist.length;
    setCurrentTrack(next);
    setIsPlaying(true);
  };
  
  // Play previous track
  const prevTrack = () => {
    const prev = (currentTrack - 1 + playlist.length) % playlist.length;
    setCurrentTrack(prev);
    setIsPlaying(true);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  // Toggle player visibility
  const togglePlayer = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="music-player" style={{
      position: 'fixed',
      bottom: isOpen ? '20px' : '30px',
      right: '20px',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      transition: 'all 0.3s ease'
    }}>
      {/* Main floating button */}
      <button 
        onClick={togglePlayer}
        className="music-player-button"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#3a3a3a',
          border: 'none',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
          marginTop: '10px'
        }}
      >
        {isOpen ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Music icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18V5L21 3V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.3431 13 15 14.3431 15 16C15 17.6569 16.3431 19 18 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      
      {/* Music player panel */}
      {isOpen && (
        <div className="music-player-panel" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
          padding: '15px',
          width: '300px',
          marginBottom: '10px'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px', 
            color: '#333',
            textAlign: 'center'
          }}>
            Background Music
          </h3>
          
          {/* Playlist */}
          <div style={{ 
            marginBottom: '15px',
            maxHeight: '150px',
            overflowY: 'auto',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            padding: '5px'
          }}>
            {playlist.map((track, index) => (
              <div 
                key={index}
                onClick={() => playTrack(index)}
                className="music-playlist-item"
                style={{
                  padding: '8px 10px',
                  marginBottom: '5px',
                  backgroundColor: currentTrack === index ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {currentTrack === index && isPlaying ? (
                    // Playing icon
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 9H9V15H15V9Z" fill="#3a3a3a" />
                    </svg>
                  ) : (
                    // Play icon
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill={currentTrack === index ? "#3a3a3a" : "#999"} />
                    </svg>
                  )}
                </div>
                <span style={{ 
                  fontSize: '14px',
                  color: currentTrack === index ? '#3a3a3a' : '#555',
                  fontWeight: currentTrack === index ? '500' : 'normal'
                }}>
                  {track.title}
                </span>
              </div>
            ))}
          </div>
          
          {/* Controls */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            {/* Previous */}
            <button
              onClick={prevTrack}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 20L9 12L19 4V20Z" fill="#555" />
                <path d="M5 4V20" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#3a3a3a',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? (
                // Pause icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4H6V20H10V4Z" fill="white" />
                  <path d="M18 4H14V20H18V4Z" fill="white" />
                </svg>
              ) : (
                // Play icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L18 12L6 20V4Z" fill="white" />
                </svg>
              )}
            </button>
            
            {/* Next */}
            <button
              onClick={nextTrack}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4L15 12L5 20V4Z" fill="#555" />
                <path d="M19 4V20" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          
          {/* Volume slider */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#999" />
              {volume > 0.3 && (
                <path d="M14 9.5C15.5 10.5 15.5 13.5 14 14.5" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {volume > 0.7 && (
                <path d="M17 7C20 9 20 15 17 17" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: '100%',
                accentColor: '#3a3a3a'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer; 