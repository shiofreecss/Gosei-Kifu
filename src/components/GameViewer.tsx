import React, { useEffect, useState } from 'react';
import KifuReader from './KifuReader';
import './GameViewer.css';

interface GameViewerProps {
  sgfContent: string;
  onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ sgfContent, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="game-viewer">
      <div className="game-viewer-modal">
        <button 
          className="game-viewer-close"
          onClick={onClose}
          aria-label="Close game viewer"
        >
          &times;
        </button>
        
        <h2 className="game-viewer-header">
          {isMobile ? "Game" : "Game Viewer"}
        </h2>
        
        <KifuReader sgfContent={sgfContent} />
      </div>
    </div>
  );
};

export default GameViewer; 