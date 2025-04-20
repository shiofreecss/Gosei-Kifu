import React, { useState, useEffect, useRef } from 'react';
import GoBoard from './GoBoard';
import KifuSettings from './KifuSettings';
import { ParsedGame, parseSGF, movesToStones } from '../utils/sgfParser';
import { applyMove, createBoardFromStones, getHandicapPositions, findCapturedStones, Position } from '../utils/goRules';
import './KifuReader.css';

interface KifuReaderProps {
  sgfContent: string;
}

// Define the interface for KifuSettings props to match the actual component
interface KifuSettingsProps {
  showMoveNumbers: boolean;
  onToggleMoveNumbers: () => void;
  enableSound: boolean;
  onToggleSound: () => void;
  autoplaySpeed?: number;
  onAutoplaySpeedChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const KifuReader: React.FC<KifuReaderProps> = ({ sgfContent }) => {
  const [game, setGame] = useState<ParsedGame | null>(null);
  const [currentMove, setCurrentMove] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [autoplayActive, setAutoplayActive] = useState<boolean>(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(1000); // ms between moves
  
  // New state for toggles
  const [showMoveNumbers, setShowMoveNumbers] = useState<boolean>(false);
  const [enableSound, setEnableSound] = useState<boolean>(false);
  
  // Reference for audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [capturedWhite, setCapturedWhite] = useState(0);
  const [capturedBlack, setCapturedBlack] = useState(0);
  const [capturedStones, setCapturedStones] = useState<{x: number, y: number, color: 'black' | 'white', moveNumber: number}[]>([]);
  
  // Add state to detect mobile viewport
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Create audio element for move sounds
    audioRef.current = new Audio('/stone-sound.mp3');
    
    // Set up mobile detection
    const checkForMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('resize', checkForMobile);
    };
  }, []);

  useEffect(() => {
    try {
      const parsed = parseSGF(sgfContent);
      setGame(parsed);
      setCurrentMove(-1); // Reset to beginning
      setError(null);
      setCapturedBlack(0);
      setCapturedWhite(0);
      setCapturedStones([]);
      
      // If the game has handicap but no explicit handicap stones, generate them
      if (parsed.info.handicap > 1 && 
          (!parsed.handicapStones || parsed.handicapStones.length === 0)) {
        parsed.handicapStones = getHandicapPositions(
          parsed.info.size,
          parsed.info.handicap
        );
      }
      
      // Pre-calculate captures for each move
      if (parsed.moves.length > 0) {
        calculateAllCaptures(parsed);
      }
    } catch (err) {
      setError('Error parsing SGF file. Please check the format.');
      console.error(err);
    }
  }, [sgfContent]);

  // Calculate captures for all moves in the game
  const calculateAllCaptures = (parsedGame: ParsedGame) => {
    const size = parsedGame.info.size;
    let board = createBoardFromStones(
      movesToStones([], parsedGame.handicapStones), 
      size
    );
    
    const allCapturedStones: {x: number, y: number, color: 'black' | 'white', moveNumber: number}[] = [];
    
    // Process each move and find captures
    parsedGame.moves.forEach((move, index) => {
      // Skip pass moves
      if (move.x < 0 || move.y < 0) return;
      
      // Find stones that would be captured by this move
      const capturedPositions = findCapturedStones(board, {
        x: move.x,
        y: move.y,
        color: move.color
      });
      
      // Record captured stones with their color (opposite of current move)
      // Use a proper type assertion to ensure type safety
      const capturedColor: 'black' | 'white' = move.color === 'black' ? 'white' : 'black';
      const moveNumber = index + 1;
      
      const capturedStonesWithMetadata = capturedPositions.map(pos => ({
        x: pos.x,
        y: pos.y,
        color: capturedColor,
        moveNumber
      }));
      
      // Add to the total captured stones list
      allCapturedStones.push(...capturedStonesWithMetadata);
      
      // Store captures in the move object for future reference
      move.captures = capturedPositions.map(pos => ({
        x: pos.x,
        y: pos.y
      }));
      
      // Apply the move to the board
      const { newBoard } = applyMove(board, {
        x: move.x,
        y: move.y,
        color: move.color
      });
      
      board = newBoard;
    });
    
    setCapturedStones(allCapturedStones);
    // Update the modified game with capture information
    setGame({...parsedGame});
  };

  useEffect(() => {
    let autoplayTimer: NodeJS.Timeout | null = null;
    
    if (autoplayActive && game) {
      if (currentMove < game.moves.length - 1) {
        autoplayTimer = setTimeout(() => {
          setCurrentMove(prev => prev + 1);
        }, autoplaySpeed);
      } else {
        setAutoplayActive(false);
      }
    }
    
    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  }, [autoplayActive, currentMove, game, autoplaySpeed]);

  // Effect for playing sound on move change
  useEffect(() => {
    if (enableSound && currentMove >= 0 && audioRef.current) {
      // Reset audio to start and play
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Error playing sound:", e));
    }
  }, [currentMove, enableSound]);

  // Effect for updating capture counts when current move changes
  useEffect(() => {
    if (game && capturedStones.length > 0) {
      updateCaptureCount(currentMove);
    }
  }, [currentMove, capturedStones]);

  const updateCaptureCount = (moveIndex: number) => {
    // Count captures up to the current move
    const relevantCaptures = capturedStones.filter(
      stone => stone.moveNumber <= moveIndex + 1
    );
    
    const whiteCaptured = relevantCaptures.filter(stone => stone.color === 'white').length;
    const blackCaptured = relevantCaptures.filter(stone => stone.color === 'black').length;
    
    setCapturedWhite(whiteCaptured);
    setCapturedBlack(blackCaptured);
  };

  const handlePrevMove = () => {
    setAutoplayActive(false);
    setCurrentMove(prev => Math.max(-1, prev - 1));
  };

  const handleNextMove = () => {
    setAutoplayActive(false);
    if (game) {
      setCurrentMove(prev => Math.min(game.moves.length - 1, prev + 1));
    }
  };

  const handleFirstMove = () => {
    setAutoplayActive(false);
    setCurrentMove(-1);
  };

  const handleLastMove = () => {
    setAutoplayActive(false);
    if (game) {
      setCurrentMove(game.moves.length - 1);
    }
  };

  const toggleAutoplay = () => {
    setAutoplayActive(prev => !prev);
  };

  const handleAutoplaySpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoplaySpeed(3000 - parseInt(e.target.value, 10));
  };

  const handleToggleMoveNumbers = () => {
    setShowMoveNumbers(prev => !prev);
  };

  const handleToggleSound = () => {
    setEnableSound(prev => !prev);
  };

  const getCurrentMoveInfo = () => {
    if (!game || currentMove < 0) return null;
    return game.moves[currentMove];
  };

  const currentMoveInfo = getCurrentMoveInfo();

  const handleMoveChange = (newMoveIndex: number) => {
    if (!game) return;
    
    if (newMoveIndex >= -1 && newMoveIndex < game.moves.length) {
      setCurrentMove(newMoveIndex);
      playStoneSound();
    }
  };

  const playStoneSound = () => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Error playing sound', e));
    }
  };

  // Filter captured stones based on the current move
  const visibleCapturedStones = capturedStones.filter(
    stone => stone.moveNumber <= currentMove + 1
  );

  return (
    <div className={`kifu-reader ${isMobile ? 'kifu-reader-mobile' : ''}`}>
      {error && (
        <div className="error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      <div className="kifu-content">
        <div className="board-container">
          <GoBoard
            size={game?.info.size || 19}
            stones={game ? movesToStones(
              currentMove >= 0 ? game.moves.slice(0, currentMove + 1) : [],
              game.handicapStones
            ) : []}
            currentMove={currentMove}
            showMoveNumbers={showMoveNumbers}
            capturedStones={visibleCapturedStones}
          />
        </div>
        <div className="controls-container">
          <div className="game-info">
            <div className="game-info-header">
              <div className="game-info-player">
                <div className="game-info-player-name">
                  <span>Black: {game?.info.playerBlack || 'Unknown'}</span>
                  <span className="game-info-player-captures">
                    Captures: {capturedBlack}
                  </span>
                </div>
              </div>
              <div className="game-info-player">
                <div className="game-info-player-name">
                  <span>White: {game?.info.playerWhite || 'Unknown'}</span>
                  <span className="game-info-player-captures">
                    Captures: {capturedWhite}
                  </span>
                </div>
              </div>
            </div>
            <div className="game-info-details">
              <span className="game-info-detail">Komi: {game?.info.komi || 6.5}</span>
              <span className="game-info-detail">Size: {game?.info.size || 19}×{game?.info.size || 19}</span>
              {game?.info.handicap && game.info.handicap > 1 && (
                <span className="game-info-detail">Handicap: {game.info.handicap}</span>
              )}
            </div>
            {currentMoveInfo?.comment && (
              <div className="game-info-comment">
                <div className="game-info-comment-title">Comment:</div>
                {currentMoveInfo.comment}
              </div>
            )}
          </div>
          <div className="navigation-container">
            <div className="move-slider">
              <button className="move-button" onClick={handleFirstMove} title="First move">
                ⏮️
              </button>
              <button className="move-button" onClick={handlePrevMove} title="Previous move">
                ⏪
              </button>
              <button className="autoplay-button" onClick={toggleAutoplay}>
                {autoplayActive ? '⏸️ Stop' : '▶️ Play'}
              </button>
              <button className="move-button" onClick={handleNextMove} title="Next move">
                ⏩
              </button>
              <button className="move-button" onClick={handleLastMove} title="Last move">
                ⏭️
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={game?.moves.length || 0}
              value={currentMove}
              onChange={(e) => handleMoveChange(parseInt(e.target.value, 10))}
              className="move-range"
            />
            <div className="move-range-info">
              <span>Move: {currentMove + 1}</span>
              <span>Total: {game?.moves.length || 0}</span>
            </div>
          </div>
          <KifuSettings
            showMoveNumbers={showMoveNumbers}
            onToggleMoveNumbers={handleToggleMoveNumbers}
            enableSound={enableSound}
            onToggleSound={handleToggleSound}
            autoplaySpeed={autoplaySpeed}
            onAutoplaySpeedChange={handleAutoplaySpeedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default KifuReader; 