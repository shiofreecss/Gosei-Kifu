export interface Position {
  x: number;
  y: number;
}

export interface Stone {
  x: number;
  y: number;
  color: 'black' | 'white';
}

/**
 * Checks if a position is within the board boundaries
 */
export const isValidPosition = (pos: Position, boardSize: number): boolean => {
  return pos.x >= 0 && pos.x < boardSize && pos.y >= 0 && pos.y < boardSize;
};

/**
 * Gets all adjacent positions (up, right, down, left)
 */
export const getAdjacentPositions = (pos: Position, boardSize: number): Position[] => {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }  // left
  ];
  
  return directions
    .map(dir => ({ x: pos.x + dir.x, y: pos.y + dir.y }))
    .filter(newPos => isValidPosition(newPos, boardSize));
};

/**
 * Creates a board representation from stones
 */
export const createBoardFromStones = (stones: Stone[], boardSize: number): ('black' | 'white' | null)[][] => {
  // Initialize empty board
  const board: ('black' | 'white' | null)[][] = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(null));
  
  // Place stones on board
  stones.forEach(stone => {
    if (isValidPosition(stone, boardSize)) {
      board[stone.y][stone.x] = stone.color;
    }
  });
  
  return board;
};

/**
 * Finds the group of connected stones of the same color
 */
export const findGroup = (
  board: ('black' | 'white' | null)[][],
  start: Position
): Position[] => {
  const boardSize = board.length;
  const color = board[start.y][start.x];
  
  if (color === null) return [];
  
  const visited: boolean[][] = Array(boardSize)
    .fill(false)
    .map(() => Array(boardSize).fill(false));
  
  const group: Position[] = [];
  const queue: Position[] = [start];
  
  while (queue.length > 0) {
    const pos = queue.shift()!;
    
    if (visited[pos.y][pos.x]) continue;
    
    visited[pos.y][pos.x] = true;
    group.push(pos);
    
    const adjacentPositions = getAdjacentPositions(pos, boardSize);
    
    for (const adjPos of adjacentPositions) {
      if (!visited[adjPos.y][adjPos.x] && board[adjPos.y][adjPos.x] === color) {
        queue.push(adjPos);
      }
    }
  }
  
  return group;
};

/**
 * Counts liberties (adjacent empty points) for a group
 */
export const countLiberties = (
  board: ('black' | 'white' | null)[][],
  group: Position[]
): number => {
  const boardSize = board.length;
  const liberties = new Set<string>();
  
  group.forEach(pos => {
    const adjacentPositions = getAdjacentPositions(pos, boardSize);
    
    adjacentPositions.forEach(adjPos => {
      if (board[adjPos.y][adjPos.x] === null) {
        liberties.add(`${adjPos.x},${adjPos.y}`);
      }
    });
  });
  
  return liberties.size;
};

/**
 * Finds all stones that would be captured by a move
 */
export const findCapturedStones = (
  board: ('black' | 'white' | null)[][],
  move: Stone
): Position[] => {
  const boardSize = board.length;
  const oppositeColor = move.color === 'black' ? 'white' : 'black';
  const capturedStones: Position[] = [];
  
  // Place the stone temporarily
  const tempBoard = board.map(row => [...row]);
  tempBoard[move.y][move.x] = move.color;
  
  // Check adjacent positions for opponent groups with zero liberties
  const adjacentPositions = getAdjacentPositions(move, boardSize);
  
  for (const adjPos of adjacentPositions) {
    if (tempBoard[adjPos.y][adjPos.x] === oppositeColor) {
      const group = findGroup(tempBoard, adjPos);
      const liberties = countLiberties(tempBoard, group);
      
      if (liberties === 0) {
        capturedStones.push(...group);
      }
    }
  }
  
  return capturedStones;
};

/**
 * Checks if a move is valid according to Go rules
 */
export const isValidMove = (
  board: ('black' | 'white' | null)[][],
  move: Stone,
  previousBoard?: ('black' | 'white' | null)[][]
): boolean => {
  const boardSize = board.length;
  
  // Check if position is on the board
  if (!isValidPosition(move, boardSize)) {
    return false;
  }
  
  // Check if position is empty
  if (board[move.y][move.x] !== null) {
    return false;
  }
  
  // Create a temporary board with the new move
  const tempBoard = board.map(row => [...row]);
  tempBoard[move.y][move.x] = move.color;
  
  // Find the group that would be formed by this move
  const group = findGroup(tempBoard, move);
  const liberties = countLiberties(tempBoard, group);
  
  // If move creates a group with liberties, it's valid
  if (liberties > 0) {
    return true;
  }
  
  // Check if move captures opponent stones
  const capturedStones = findCapturedStones(board, move);
  
  if (capturedStones.length > 0) {
    // Check for ko rule if previous board state is provided
    if (previousBoard) {
      // Apply captures to create next board state
      const nextBoard = tempBoard.map(row => [...row]);
      capturedStones.forEach(pos => {
        nextBoard[pos.y][pos.x] = null;
      });
      
      // Check if next board state equals previous board state (ko)
      const boardsEqual = previousBoard.every((row, y) => 
        row.every((cell, x) => cell === nextBoard[y][x])
      );
      
      if (boardsEqual) {
        return false; // Ko rule violation
      }
    }
    
    return true; // Capturing moves are valid
  }
  
  // Move is suicide and doesn't capture - invalid
  return false;
};

/**
 * Applies a move to the board and returns the new board state and captured stones
 */
export const applyMove = (
  board: ('black' | 'white' | null)[][],
  move: Stone
): {
  newBoard: ('black' | 'white' | null)[][],
  capturedStones: Position[]
} => {
  const capturedStones = findCapturedStones(board, move);
  const newBoard = board.map(row => [...row]);
  
  // Place the stone
  newBoard[move.y][move.x] = move.color;
  
  // Remove captured stones
  capturedStones.forEach(pos => {
    newBoard[pos.y][pos.x] = null;
  });
  
  return { newBoard, capturedStones };
};

/**
 * Gets standard handicap positions for a given board size and handicap number
 */
export const getHandicapPositions = (boardSize: number, handicap: number): Position[] => {
  if (handicap < 2 || handicap > 9) return [];
  
  // Only standard board sizes support handicap stones
  if (boardSize !== 19 && boardSize !== 13 && boardSize !== 9) return [];
  
  let starPoints: Position[] = [];
  
  if (boardSize === 19) {
    starPoints = [
      { x: 3, y: 3 },   // bottom left
      { x: 15, y: 15 }, // top right
      { x: 15, y: 3 },  // bottom right
      { x: 3, y: 15 },  // top left
      { x: 9, y: 9 },   // center
      { x: 3, y: 9 },   // left middle
      { x: 15, y: 9 },  // right middle
      { x: 9, y: 3 },   // bottom middle
      { x: 9, y: 15 }   // top middle
    ];
  } else if (boardSize === 13) {
    starPoints = [
      { x: 3, y: 3 },   // bottom left
      { x: 9, y: 9 },   // top right
      { x: 9, y: 3 },   // bottom right
      { x: 3, y: 9 },   // top left
      { x: 6, y: 6 },   // center
      { x: 3, y: 6 },   // left middle
      { x: 9, y: 6 },   // right middle
      { x: 6, y: 3 },   // bottom middle
      { x: 6, y: 9 }    // top middle
    ];
  } else if (boardSize === 9) {
    starPoints = [
      { x: 2, y: 2 },   // bottom left
      { x: 6, y: 6 },   // top right
      { x: 6, y: 2 },   // bottom right
      { x: 2, y: 6 },   // top left
      { x: 4, y: 4 },   // center
      { x: 2, y: 4 },   // left middle
      { x: 6, y: 4 },   // right middle
      { x: 4, y: 2 },   // bottom middle
      { x: 4, y: 6 }    // top middle
    ];
  }
  
  // Return only the required number of handicap stones
  return starPoints.slice(0, handicap);
};

/**
 * Calculates territory and scoring for the current board state
 * Note: This is a simplified implementation and may not handle all edge cases
 */
export const calculateTerritory = (
  board: ('black' | 'white' | null)[][],
): {
  blackTerritory: number,
  whiteTerritory: number,
  blackCaptures: number,
  whiteCaptures: number
} => {
  const boardSize = board.length;
  
  // Create a copy of the board to mark territory
  const territoryBoard = board.map(row => [...row]);
  
  // Initialize territory counts
  let blackTerritory = 0;
  let whiteTerritory = 0;
  
  // Function to flood fill and determine territory ownership
  const floodFillTerritory = (startX: number, startY: number) => {
    if (territoryBoard[startY][startX] !== null) return null;
    
    const queue: Position[] = [{ x: startX, y: startY }];
    const territory: Position[] = [];
    let isBlackBordered = false;
    let isWhiteBordered = false;
    
    const visited: boolean[][] = Array(boardSize)
      .fill(false)
      .map(() => Array(boardSize).fill(false));
    
    while (queue.length > 0) {
      const pos = queue.shift()!;
      
      if (visited[pos.y][pos.x]) continue;
      
      visited[pos.y][pos.x] = true;
      
      if (territoryBoard[pos.y][pos.x] === null) {
        territory.push(pos);
        
        const adjacentPositions = getAdjacentPositions(pos, boardSize);
        
        for (const adjPos of adjacentPositions) {
          const adjCell = territoryBoard[adjPos.y][adjPos.x];
          
          if (adjCell === null) {
            queue.push(adjPos);
          } else if (adjCell === 'black') {
            isBlackBordered = true;
          } else if (adjCell === 'white') {
            isWhiteBordered = true;
          }
        }
      }
    }
    
    // Determine ownership of territory
    let owner = null;
    if (isBlackBordered && !isWhiteBordered) {
      owner = 'black';
      blackTerritory += territory.length;
    } else if (isWhiteBordered && !isBlackBordered) {
      owner = 'white';
      whiteTerritory += territory.length;
    }
    
    // Mark territory on board to avoid recounting
    territory.forEach(pos => {
      territoryBoard[pos.y][pos.x] = 'marked' as any;
    });
    
    return { territory, owner };
  };
  
  // Scan the board for empty spaces and determine territory
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (territoryBoard[y][x] === null) {
        floodFillTerritory(x, y);
      }
    }
  }
  
  return {
    blackTerritory,
    whiteTerritory,
    blackCaptures: 0, // These would be tracked separately during game play
    whiteCaptures: 0
  };
}; 