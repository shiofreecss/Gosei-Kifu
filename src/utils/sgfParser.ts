export interface GameInfo {
  playerBlack: string;
  playerWhite: string;
  result: string;
  date: string;
  komi: number;
  size: number;
  handicap: number;
}

export interface Move {
  color: 'black' | 'white';
  x: number;
  y: number;
  moveNumber: number;
  comment?: string;
  captures?: { x: number, y: number }[];  // Stores positions of captured stones
}

export interface ParsedGame {
  info: GameInfo;
  moves: Move[];
  handicapStones?: { x: number, y: number }[];
}

// Convert SGF coordinates to board coordinates
// SGF uses letters starting from 'a' for coordinates (a=0, b=1, etc.)
const sgfToCoordinate = (coord: string): number => {
  if (!coord || coord === '') return -1; // For pass moves
  return coord.charCodeAt(0) - 'a'.charCodeAt(0);
};

// Parse SGF property value
const parseProperty = (property: string): string => {
  return property.replace(/^\[|\]$/g, '');
};

// Parse SGF format
export const parseSGF = (sgfContent: string): ParsedGame => {
  const game: ParsedGame = {
    info: {
      playerBlack: 'Unknown',
      playerWhite: 'Unknown',
      result: '?',
      date: '',
      komi: 6.5,
      size: 19,
      handicap: 0,
    },
    moves: [],
  };

  // Remove whitespace and newlines for easier parsing
  const cleanSgf = sgfContent.replace(/\s+/g, '');
  
  // Extract properties with regex
  const propertyRegex = /([A-Z]+)(\[[^\]]*\])+/g;
  let match;
  let moveNumber = 0;
  let currentColor: 'black' | 'white' = 'black'; // B goes first in Go
  let lastComment = '';
  
  // This will store AB property values which are typically handicap stones
  const handicapPositions: { x: number, y: number }[] = [];

  // Check for captured stones in SGF (AW for adding white, AB for adding black)
  let captureData: { [moveNumber: number]: { x: number, y: number }[] } = {};

  while ((match = propertyRegex.exec(cleanSgf)) !== null) {
    const [_, propertyName, propertyValueWithBrackets] = match;
    
    // Extract all property values (could be multiple [..][..])
    const valueMatches = propertyValueWithBrackets.match(/\[([^\]]*)\]/g) || [];
    const propertyValues = valueMatches.map(val => parseProperty(val));
    
    switch (propertyName) {
      case 'SZ':
        game.info.size = parseInt(propertyValues[0], 10);
        break;
      case 'KM':
        game.info.komi = parseFloat(propertyValues[0]);
        break;
      case 'PB':
        game.info.playerBlack = propertyValues[0];
        break;
      case 'PW':
        game.info.playerWhite = propertyValues[0];
        break;
      case 'DT':
        game.info.date = propertyValues[0];
        break;
      case 'RE':
        game.info.result = propertyValues[0];
        break;
      case 'HA':
        game.info.handicap = parseInt(propertyValues[0], 10);
        break;
      case 'AB':
        // Add Black - typically used for handicap stones
        propertyValues.forEach(coordStr => {
          if (coordStr.length >= 2) {
            handicapPositions.push({
              x: sgfToCoordinate(coordStr[0]),
              y: sgfToCoordinate(coordStr[1])
            });
          }
        });
        break;
      case 'AW':
        // Add White - in some variations of SGF, used for setup
        // Not directly related to captures, but keeping for completeness
        break;
      case 'C':
        lastComment = propertyValues[0];
        break;
      case 'B':
        if (propertyValues[0] !== '') {
          moveNumber++;
          const coords = propertyValues[0];
          game.moves.push({
            color: 'black',
            x: sgfToCoordinate(coords[0]),
            y: sgfToCoordinate(coords[1]),
            moveNumber,
            comment: lastComment || undefined,
            captures: captureData[moveNumber] || []
          });
          lastComment = '';
          currentColor = 'white';
        }
        break;
      case 'W':
        if (propertyValues[0] !== '') {
          moveNumber++;
          const coords = propertyValues[0];
          game.moves.push({
            color: 'white',
            x: sgfToCoordinate(coords[0]),
            y: sgfToCoordinate(coords[1]),
            moveNumber,
            comment: lastComment || undefined,
            captures: captureData[moveNumber] || []
          });
          lastComment = '';
          currentColor = 'black';
        }
        break;
    }
  }

  // Add handicap stones to the game
  if (handicapPositions.length > 0) {
    game.handicapStones = handicapPositions;
    // Update handicap count if it wasn't explicitly set in the SGF
    if (game.info.handicap === 0) {
      game.info.handicap = handicapPositions.length;
    }
  }

  // Process Japanese kifu format if SGF parsing failed or has no moves
  if (game.moves.length === 0 && sgfContent.includes('黒') && sgfContent.includes('白')) {
    const kifuLines = sgfContent.split('\n');
    parseJapaneseKifu(kifuLines, game);
  }

  return game;
};

// Handle Japanese coordinate notation (numbers and katakana)
export const japaneseCoordinateToSGF = (japaneseCoord: string): [number, number] => {
  // This is a simplified implementation
  // In real kifu, columns are usually numbers and rows are katakana or hiragana
  const columns = "123456789abcdefghij";
  const rows = "abcdefghijklmnopqrs"; // Simplified mapping for katakana/hiragana
  
  if (japaneseCoord.length < 2) return [-1, -1];
  
  const col = columns.indexOf(japaneseCoord[0].toLowerCase());
  const row = rows.indexOf(japaneseCoord[1].toLowerCase());
  
  return [col, row];
};

// Parse traditional Japanese kifu format
const parseJapaneseKifu = (lines: string[], game: ParsedGame) => {
  let moveNumber = 0;
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') continue;
    
    // Look for move patterns like "1. 黒: Q16" (Black: Q16)
    const moveMatch = line.match(/^(\d+)[\.\s:]+([黒白])[\s:]+([A-T][1-9][0-9]?)/i);
    if (moveMatch) {
      moveNumber++;
      const color = moveMatch[2] === '黒' ? 'black' : 'white';
      const coord = moveMatch[3].toUpperCase();
      
      // Convert traditional board coordinates (A1, Q16, etc) to SGF coordinates
      const x = coord.charCodeAt(0) - 'A'.charCodeAt(0);
      const y = game.info.size - parseInt(coord.substring(1), 10);
      
      game.moves.push({
        color,
        x,
        y,
        moveNumber,
        comment: '',
        captures: []
      });
    }
    
    // Look for game info like "黒：Player Black"
    const blackPlayerMatch = line.match(/^#\s*黒[:：]\s*(.+)/);
    if (blackPlayerMatch) {
      game.info.playerBlack = blackPlayerMatch[1].trim();
    }
    
    const whitePlayerMatch = line.match(/^#\s*白[:：]\s*(.+)/);
    if (whitePlayerMatch) {
      game.info.playerWhite = whitePlayerMatch[1].trim();
    }
    
    const resultMatch = line.match(/^#\s*結果[:：]\s*(.+)/);
    if (resultMatch) {
      game.info.result = resultMatch[1].trim();
    }
    
    const dateMatch = line.match(/^#\s*日付[:：]\s*(.+)/);
    if (dateMatch) {
      game.info.date = dateMatch[1].trim();
    }
  }
};

// Convert moves to stones for rendering
export const movesToStones = (moves: Move[], handicapStones?: { x: number, y: number }[]) => {
  const stones = moves.map(move => ({
    x: move.x,
    y: move.y,
    color: move.color
  }));
  
  // Add handicap stones to the list (always black)
  if (handicapStones && handicapStones.length > 0) {
    handicapStones.forEach(stone => {
      stones.push({
        x: stone.x,
        y: stone.y,
        color: 'black' as const
      });
    });
  }
  
  return stones;
}; 