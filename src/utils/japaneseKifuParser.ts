import { GameInfo, Move, ParsedGame } from './sgfParser';

// Convert Japanese coordinate to board coordinates
// e.g., "Q16" → [15, 3] (0-indexed)
const japaneseCoordinateToBoard = (coord: string): [number, number] => {
  if (!coord || coord.length < 2) return [-1, -1]; // Invalid or pass move
  
  // Japanese Go board has coordinates like Q16, where:
  // - Letter (horizontal): A-T (excluding I)
  // - Number (vertical): 1-19 (from top to bottom)
  
  // Letter mapping (horizontal coordinate)
  const letters = "ABCDEFGHJKLMNOPQRST"; // No 'I'
  const x = letters.indexOf(coord[0].toUpperCase());
  
  // Number (vertical coordinate), subtract 1 for 0-indexed
  const y = parseInt(coord.substring(1), 10) - 1;
  
  return [x, y];
};

// Parse Japanese kifu format
export const parseJapaneseKifu = (kifuContent: string): ParsedGame => {
  const lines = kifuContent.split('\n').filter(line => line.trim() !== '');
  
  const game: ParsedGame = {
    info: {
      playerBlack: 'Unknown',
      playerWhite: 'Unknown',
      result: '?',
      date: '',
      komi: 6.5,
      size: 19, // Default board size
      handicap: 0, // Add handicap property with default value of 0
    },
    moves: [],
  };
  
  // Process header information
  let i = 0;
  while (i < lines.length && lines[i].startsWith('#')) {
    const line = lines[i].substring(1).trim();
    
    if (line.startsWith('黒：') || line.startsWith('黒:')) {
      game.info.playerBlack = line.substring(line.indexOf('：') + 1 || line.indexOf(':') + 1).trim();
    } else if (line.startsWith('白：') || line.startsWith('白:')) {
      game.info.playerWhite = line.substring(line.indexOf('：') + 1 || line.indexOf(':') + 1).trim();
    } else if (line.startsWith('日付:') || line.startsWith('日付：')) {
      game.info.date = line.substring(line.indexOf('：') + 1 || line.indexOf(':') + 1).trim();
    } else if (line.startsWith('結果:') || line.startsWith('結果：')) {
      game.info.result = line.substring(line.indexOf('：') + 1 || line.indexOf(':') + 1).trim();
    } else if (line.includes('コミ') || line.toLowerCase().includes('komi')) {
      const komiMatch = line.match(/[\d.]+/);
      if (komiMatch) {
        game.info.komi = parseFloat(komiMatch[0]);
      }
    } else if (line.includes('置石') || line.toLowerCase().includes('handicap')) {
      const handicapMatch = line.match(/\d+/);
      if (handicapMatch) {
        game.info.handicap = parseInt(handicapMatch[0], 10);
      }
    }
    
    i++;
  }
  
  // Process moves
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comment lines
    if (line.startsWith('#')) continue;
    
    // Extract move number, color and coordinate
    const moveMatch = line.match(/(\d+)\.\s*(黒|白|B|W|Black|White)[:：]?\s*([A-T]\d{1,2})/i);
    
    if (moveMatch) {
      const moveNumber = parseInt(moveMatch[1], 10);
      const colorText = moveMatch[2].toLowerCase();
      const coord = moveMatch[3];
      
      const color = colorText.includes('黒') || colorText === 'b' || colorText === 'black' 
        ? 'black' 
        : 'white';
      
      const [x, y] = japaneseCoordinateToBoard(coord);
      
      if (x >= 0 && y >= 0) {
        game.moves.push({
          color,
          x,
          y,
          moveNumber,
        });
      }
    }
  }
  
  return game;
};

// Convert Japanese kifu to SGF format
export const japaneseKifuToSGF = (kifuContent: string): string => {
  const game = parseJapaneseKifu(kifuContent);
  
  // Create SGF header
  let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[AI-Kifu]ST[2]
RU[Japanese]SZ[${game.info.size}]KM[${game.info.komi}]
PW[${game.info.playerWhite}]PB[${game.info.playerBlack}]`;
  
  if (game.info.date) {
    sgf += `\nDT[${game.info.date}]`;
  }
  
  if (game.info.result) {
    sgf += `\nRE[${game.info.result}]`;
  }
  
  if (game.info.handicap > 0) {
    sgf += `\nHA[${game.info.handicap}]`;
  }
  
  // Add moves
  for (const move of game.moves) {
    const color = move.color === 'black' ? 'B' : 'W';
    // Convert to SGF coordinates (letters, a=0, b=1, etc.)
    const x = String.fromCharCode(97 + move.x); // 'a' is 97 in ASCII
    const y = String.fromCharCode(97 + move.y);
    
    sgf += `\n;${color}[${x}${y}]`;
    
    if (move.comment) {
      sgf += `C[${move.comment}]`;
    }
  }
  
  sgf += '\n)';
  return sgf;
}; 