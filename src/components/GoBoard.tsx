import React, { useMemo, useCallback, useState, useEffect } from 'react';
import './GoBoard.css';

interface Stone {
  x: number;
  y: number;
  color: 'black' | 'white';
}

interface CapturedStone {
  x: number;
  y: number;
  color: 'black' | 'white';
  moveNumber: number;
}

interface GoBoardProps {
  size: number;
  stones: Stone[];
  currentMove?: number;
  showMoveNumbers?: boolean;
  capturedStones?: CapturedStone[];
  onClick?: (x: number, y: number) => void;
}

const GoBoard: React.FC<GoBoardProps> = ({ 
  size = 19, 
  stones = [], 
  currentMove = -1, 
  showMoveNumbers = false,
  capturedStones = [],
  onClick 
}) => {
  // Make cellSize responsive based on screen width
  const [cellSize, setCellSize] = useState(32);
  
  // Add effect to adjust cell size based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 360) {
        setCellSize(13); // Very small screens
      } else if (width <= 480) {
        setCellSize(15); // Small mobile
      } else if (width <= 768) {
        setCellSize(20); // Tablets
      } else if (width <= 1024) {
        setCellSize(28); // Small laptops
      } else {
        setCellSize(32); // Default size
      }
    };
    
    // Initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const boardSize = (size - 1) * cellSize;
  const boardPadding = cellSize / 2;
  
  // Calculate positions for star points (hoshi)
  const getHoshiPoints = useCallback((boardSize: number) => {
    if (size === 19) return [3, 9, 15];
    if (size === 13) return [3, 6, 9];
    if (size === 9) return [2, 4, 6];
    return [];
  }, [size]);
  
  const hoshiPoints = useMemo(() => getHoshiPoints(size), [getHoshiPoints, size]);
  
  const handleCellClick = useCallback((x: number, y: number) => {
    if (onClick) onClick(x, y);
  }, [onClick]);
  
  // Create a map of captured stones for easier lookup
  const capturedStonesMap = useMemo(() => {
    const map = new Map<string, CapturedStone>();
    if (capturedStones.length > 0) {
      capturedStones.forEach(stone => {
        map.set(`${stone.x},${stone.y}`, stone);
      });
    }
    return map;
  }, [capturedStones]);
  
  // Determine if a stone at given coordinates is captured
  const isStoneVisible = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    if (!capturedStonesMap.has(key)) return true;
    
    // If stone is in the captured map, it's not visible
    return false;
  }, [capturedStonesMap]);
  
  const renderStones = useCallback(() => {
    const visibleStones = stones.slice(0, currentMove >= 0 ? currentMove + 1 : stones.length);
    
    return visibleStones.map((stone, index) => {
      const isLatestMove = index === (currentMove >= 0 ? currentMove : visibleStones.length - 1);
      const moveNumber = index + 1;
      
      // Skip rendering if the stone is captured
      if (!isStoneVisible(stone.x, stone.y)) return null;
      
      // Adjust stone size for better visibility on small screens
      const stoneRadius = cellSize <= 15 ? cellSize * 0.48 : cellSize * 0.45;
      
      return (
        <g key={`${stone.x}-${stone.y}`}>
          {/* Stone shadow */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize + 1.5}
            r={stoneRadius}
            fill="rgba(0,0,0,0.15)"
            style={{ filter: 'blur(1px)' }}
          />
          
          {/* Actual stone */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize}
            r={stoneRadius}
            fill={stone.color}
            stroke={stone.color === 'black' ? '#222' : '#888'} // Improved contrast for white stones
            strokeWidth={0.8} // Slightly thicker border
            style={{ 
              filter: stone.color === 'black' 
                ? 'brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.4))' 
                : 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Latest move marker (only show if not showing move numbers) */}
          {isLatestMove && !showMoveNumbers && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.18} // Larger indicator
              fill={stone.color === 'black' ? 'white' : 'black'}
              opacity={0.8}
            />
          )}
          
          {/* Move number */}
          {showMoveNumbers && (
            <text
              x={stone.x * cellSize}
              y={stone.y * cellSize + 5}
              textAnchor="middle"
              fontSize={cellSize * 0.4} // Larger font for better readability
              fontFamily="sans-serif"
              fontWeight="bold"
              fill={stone.color === 'black' ? 'white' : 'black'}
              style={{ userSelect: 'none' }}
            >
              {moveNumber}
            </text>
          )}
        </g>
      );
    });
  }, [stones, currentMove, showMoveNumbers, isStoneVisible, cellSize]);
  
  // Render any captured stones with a special style
  const renderCapturedStones = useCallback(() => {
    if (!capturedStones || capturedStones.length === 0) return null;
    
    // Only show captures up to the current move
    const visibleCaptures = capturedStones.filter(
      stone => stone.moveNumber <= (currentMove >= 0 ? currentMove + 1 : stones.length)
    );
    
    // Create an animation effect for recent captures (stones captured in the last move)
    const lastMoveNumber = currentMove >= 0 ? currentMove + 1 : stones.length;
    
    return visibleCaptures.map((stone, index) => {
      const isRecentCapture = stone.moveNumber === lastMoveNumber;
      
      return (
        <g key={`captured-${stone.x}-${stone.y}-${index}`}>
          {/* Show a more visible "X" mark where the stone was captured */}
          <line
            x1={(stone.x * cellSize) - (cellSize * 0.3)}
            y1={(stone.y * cellSize) - (cellSize * 0.3)}
            x2={(stone.x * cellSize) + (cellSize * 0.3)}
            y2={(stone.y * cellSize) + (cellSize * 0.3)}
            stroke={stone.color === 'black' ? '#333' : '#888'} // Better contrast
            strokeWidth={1.5} // Thicker line for better visibility
            opacity={0.6} // Higher opacity for better visibility
            strokeDasharray={isRecentCapture ? "0" : "3,2"}
          />
          <line
            x1={(stone.x * cellSize) + (cellSize * 0.3)}
            y1={(stone.y * cellSize) - (cellSize * 0.3)}
            x2={(stone.x * cellSize) - (cellSize * 0.3)}
            y2={(stone.y * cellSize) + (cellSize * 0.3)}
            stroke={stone.color === 'black' ? '#333' : '#888'} // Better contrast
            strokeWidth={1.5} // Thicker line for better visibility
            opacity={0.6} // Higher opacity for better visibility
            strokeDasharray={isRecentCapture ? "0" : "3,2"}
          />
          
          {/* Add a more visible ghost of the stone for recent captures */}
          {isRecentCapture && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.25} // Larger ghost
              fill={stone.color}
              opacity={0.15} // Slightly more visible
            />
          )}
        </g>
      );
    });
  }, [capturedStones, currentMove, stones.length, cellSize]);
  
  const renderGrid = useCallback(() => {
    const lines = [];
    
    // Horizontal lines
    for (let i = 0; i < size; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={boardSize}
          y2={i * cellSize}
          stroke="#333" // Darker lines for better contrast
          strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
        />
      );
    }
    
    // Vertical lines
    for (let i = 0; i < size; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={boardSize}
          stroke="#333" // Darker lines for better contrast
          strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
        />
      );
    }
    
    return lines;
  }, [size, cellSize, boardSize]);
  
  const renderCoordinates = useCallback(() => {
    const coords = [];
    const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // Skip 'I'
    
    // Column coordinates (letters)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`col-${i}`}
          x={i * cellSize}
          y={boardSize + boardPadding * 2}
          textAnchor="middle"
          fill="#333" // Darker text for better contrast
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {letters[i]}
        </text>
      );
    }
    
    // Row coordinates (numbers)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`row-${i}`}
          x={-boardPadding * 1.5}
          y={i * cellSize + cellSize * 0.15}
          textAnchor="middle"
          fill="#333" // Darker text for better contrast
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {size - i}
        </text>
      );
    }
    
    return coords;
  }, [size, cellSize, boardSize, boardPadding]);
  
  const renderHoshiPoints = useCallback(() => {
    const points = [];
    
    for (const x of hoshiPoints) {
      for (const y of hoshiPoints) {
        points.push(
          <circle
            key={`hoshi-${x}-${y}`}
            cx={x * cellSize}
            cy={y * cellSize}
            r={Math.max(3, cellSize * 0.12)} // Responsive star point size
            fill="#333" // Darker for better contrast
          />
        );
      }
    }
    
    return points;
  }, [hoshiPoints, cellSize]);
  
  const renderCellOverlays = useCallback(() => {
    if (!onClick) return null;
    
    const overlays = [];
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Skip if there's already a stone at this position
        const hasStone = stones.some(stone => 
          stone.x === x && stone.y === y &&
          isStoneVisible(stone.x, stone.y)
        );
        
        if (!hasStone) {
          overlays.push(
            <rect
              key={`overlay-${x}-${y}`}
              x={(x * cellSize) - (cellSize / 2)}
              y={(y * cellSize) - (cellSize / 2)}
              width={cellSize}
              height={cellSize}
              fill="transparent"
              onClick={() => handleCellClick(x, y)}
              style={{ cursor: 'pointer' }}
            />
          );
        }
      }
    }
    
    return overlays;
  }, [size, cellSize, stones, isStoneVisible, onClick, handleCellClick]);
  
  return (
    <div className="go-board-container">
      <svg
        className="go-board"
        width={boardSize + boardPadding * 3}
        height={boardSize + boardPadding * 4}
        viewBox={`${-boardPadding * 2} ${-boardPadding} ${boardSize + boardPadding * 3} ${boardSize + boardPadding * 4}`}
      >
        {/* Board grid */}
        <g>{renderGrid()}</g>
        
        {/* Star points */}
        <g>{renderHoshiPoints()}</g>
        
        {/* Captured stones' marks */}
        <g>{renderCapturedStones()}</g>
        
        {/* Active stones */}
        <g>{renderStones()}</g>
        
        {/* Coordinates - hide on very small screens */}
        {cellSize > 14 && <g>{renderCoordinates()}</g>}
        
        {/* Interactive overlays */}
        {onClick && <g>{renderCellOverlays()}</g>}
      </svg>
    </div>
  );
};

// Memoize the entire GoBoard component to prevent unnecessary re-renders
export default React.memo(GoBoard); 