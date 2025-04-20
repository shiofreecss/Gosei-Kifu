// Interface for tournament information
export interface Tournament {
  id: string;
  name: string;
  path: string;
  description?: string;
  years?: string;
}

// Interface for game information
export interface GameInfo {
  id: string;
  tournament: string;
  title: string;
  players: string[];
  date: string;
  result: string;
  path: string;
}

// Interface for tournament category
export interface TournamentCategory {
  id: string;
  name: string;
  description: string;
  subcategories?: TournamentSubcategory[];
}

// Interface for tournament subcategory
export interface TournamentSubcategory {
  id: string;
  name: string;
  description?: string;
  tournaments: string[];
}

// Main directories with tournament categories - improved structure with subcategories
export const mainCategories: TournamentCategory[] = [
  { 
    id: 'major_tournaments', 
    name: 'Major Tournaments', 
    description: 'The seven major Japanese professional title tournaments',
    subcategories: [
      {
        id: 'major_current',
        name: 'Current Majors',
        tournaments: ['Meijin', 'Honinbo', 'Judan', 'Tengen', 'Kisei', 'Gosei', 'Oza']
      },
      {
        id: 'major_historical',
        name: 'Historical Majors',
        tournaments: ['OMeijin', 'NKCh', 'NK1st', 'NK_HighestDans']
      }
    ]
  },
  { 
    id: 'other_tournaments', 
    name: 'Other Japanese Tournaments', 
    description: 'Regular Japanese tournaments, women\'s tournaments, and special events',
    subcategories: [
      {
        id: 'fast_games',
        name: 'Fast Game Tournaments',
        description: 'Quick-play and lightning tournaments',
        tournaments: ['Hayago', 'Hayago_Meijin', 'JAL_Super_Hayago', 'JAL_Shinei_Hayago']
      },
      {
        id: 'women_tournaments',
        name: 'Women\'s Tournaments',
        tournaments: ['FMeijin', 'FHoninbo', 'FSaikyo', 'FKansai', 'JAL_Female_Hayago', 'Fumakilla', 'Teikei_FLegend']
      },
      {
        id: 'special_tournaments',
        name: 'Special Format Tournaments',
        tournaments: ['Over40', 'Shinjin-O', 'ProPairgo', 'HeiseiPanda', 'Shinei', 'ShineiS', 'ProBest10']
      },
      {
        id: 'regional_tournaments',
        name: 'Regional Tournaments',
        tournaments: ['KK', 'KK1st', 'KOpen', 'Keiinsha', 'Kintetsu', 'Nakano']
      },
      {
        id: 'sponsored_tournaments',
        name: 'Sponsored Tournaments',
        tournaments: ['NHK', 'NEC', 'NEC_Shunei', 'JT', 'IBM', 'Toyota', 'Kirin', 'JAA', 'GoNet', 'ShusaiCup', 'Masuda']
      },
      {
        id: 'other_japanese',
        name: 'Other Japanese Tournaments',
        tournaments: ['Agon', 'Kakusei', 'Ryusei', 'Okan', 'Saikyo', 'Saikoi', 'Ryuen', 'Okage', 'Senko', 'SGW', 'Phoenix', 'Tatsujin', 'Wakatake', 'Yucho', 'YsCup', 'Yugen', 'Minister', 'Oteai', 'WCont', 'Teikei_Shunei', 'Teikei_Legend', 'TokyoShinbun', 'Tri', 'NTV_NihonSeries', 'NTV_FMeijin', 'misc']
      }
    ]
  },
  { 
    id: 'international', 
    name: 'International Tournaments', 
    description: 'Major international tournaments and cross-country competitions',
    subcategories: [
      {
        id: 'major_international',
        name: 'Major International',
        tournaments: ['Samsung', 'LG', 'Fujitsu', 'Ing', 'Mlily', 'Globis', 'Masters', 'Nie_Weiping_Cup', 'Go_Seigen_Cup']
      },
      {
        id: 'inter_country',
        name: 'International Title Matches',
        tournaments: ['IMeijin', 'ITengen', 'IAgon', 'IOkage', 'ISenko', 'IRyusei', 'CJSuperGo', 'Ibero', 'jastec']
      }
    ]
  },
  { 
    id: 'players', 
    name: 'Player Collections', 
    description: 'Game collections of famous professional players',
    subcategories: [
      {
        id: 'modern_masters',
        name: 'Modern Masters',
        tournaments: ['Cho_Chikun', 'Players']
      },
      {
        id: 'historical_masters',
        name: 'Historical Masters',
        tournaments: ['Go_Seigen', 'Takagawa', 'Shusai', 'Shusaku', 'Dosaku']
      }
    ]
  },
  { 
    id: 'special', 
    name: 'Special Collections', 
    description: 'Unusual games, different board sizes, and historical collections',
    subcategories: [
      {
        id: 'special_collections',
        name: 'Special Collections',
        tournaments: ['Hoensha', 'handicap', 'other_sizes']
      }
    ]
  }
];

// Map tournament directories to categories (flat structure for lookup)
const tournamentCategories: Record<string, string> = {
  // Major tournaments (the 7 major Japanese title tournaments)
  'Meijin': 'major_tournaments',
  'Honinbo': 'major_tournaments',
  'Judan': 'major_tournaments',
  'Tengen': 'major_tournaments',
  'Kisei': 'major_tournaments',
  'Gosei': 'major_tournaments',
  'Oza': 'major_tournaments',

  // Historical major tournaments
  'OMeijin': 'major_tournaments',
  'NKCh': 'major_tournaments',
  'NK1st': 'major_tournaments',
  'NK_HighestDans': 'major_tournaments',
  
  // Other Japanese tournaments - Fast Games
  'Hayago': 'other_tournaments',
  'Hayago_Meijin': 'other_tournaments',
  'JAL_Super_Hayago': 'other_tournaments',
  'JAL_Shinei_Hayago': 'other_tournaments',
  
  // Women's tournaments
  'FMeijin': 'other_tournaments',
  'FHoninbo': 'other_tournaments',
  'FSaikyo': 'other_tournaments',
  'FKansai': 'other_tournaments',
  'JAL_Female_Hayago': 'other_tournaments',
  'Fumakilla': 'other_tournaments',
  'Teikei_FLegend': 'other_tournaments',
  
  // Special format tournaments
  'Over40': 'other_tournaments',
  'Shinjin-O': 'other_tournaments',
  'ProPairgo': 'other_tournaments',
  'HeiseiPanda': 'other_tournaments',
  'Shinei': 'other_tournaments',
  'ShineiS': 'other_tournaments',
  'ProBest10': 'other_tournaments',
  
  // Regional tournaments
  'KK': 'other_tournaments',
  'KK1st': 'other_tournaments',
  'KOpen': 'other_tournaments',
  'Keiinsha': 'other_tournaments',
  'Kintetsu': 'other_tournaments',
  'Nakano': 'other_tournaments',
  
  // Sponsored tournaments
  'NHK': 'other_tournaments',
  'NEC': 'other_tournaments',
  'NEC_Shunei': 'other_tournaments',
  'JT': 'other_tournaments', 
  'IBM': 'other_tournaments',
  'Toyota': 'other_tournaments',
  'Kirin': 'other_tournaments',
  'JAA': 'other_tournaments',
  'GoNet': 'other_tournaments',
  'ShusaiCup': 'other_tournaments',
  'Masuda': 'other_tournaments',
  
  // Other Japanese tournaments
  'Agon': 'other_tournaments',
  'Kakusei': 'other_tournaments',
  'Ryusei': 'other_tournaments',
  'Okan': 'other_tournaments',
  'Saikyo': 'other_tournaments',
  'Saikoi': 'other_tournaments',
  'Ryuen': 'other_tournaments',
  'Okage': 'other_tournaments',
  'Senko': 'other_tournaments',
  'SGW': 'other_tournaments',
  'Phoenix': 'other_tournaments',
  'Tatsujin': 'other_tournaments',
  'Wakatake': 'other_tournaments',
  'Yucho': 'other_tournaments',
  'YsCup': 'other_tournaments',
  'Yugen': 'other_tournaments',
  'Minister': 'other_tournaments',
  'Oteai': 'other_tournaments',
  'WCont': 'other_tournaments',
  'Teikei_Shunei': 'other_tournaments',
  'Teikei_Legend': 'other_tournaments',
  'TokyoShinbun': 'other_tournaments',
  'Tri': 'other_tournaments',
  'NTV_NihonSeries': 'other_tournaments',
  'NTV_FMeijin': 'other_tournaments',
  'misc': 'other_tournaments',
  'Aizu': 'other_tournaments',
  'AJ1st': 'other_tournaments',
  'Asahi_Top8': 'other_tournaments',
  'Champions': 'other_tournaments',
  'Chikurin': 'other_tournaments',
  'Chisato': 'other_tournaments',
  'Chubu_Saikoi': 'other_tournaments',
  'Daiwa': 'other_tournaments',
  'DaiwaGC': 'other_tournaments',
  'FDaiwa': 'other_tournaments',
  'Densei': 'other_tournaments',
  'Discovery': 'other_tournaments',
  'Eikyu': 'other_tournaments',
  'HakataKamachi': 'other_tournaments',
  'Alum': 'other_tournaments',
  'NK': 'other_tournaments',
  'FChamp': 'other_tournaments',
  'FKakusei': 'other_tournaments',
  'FKisei': 'other_tournaments',
  
  // International tournaments - Major
  'Samsung': 'international',
  'LG': 'international',
  'Fujitsu': 'international',
  'Ing': 'international',
  'Mlily': 'international',
  'Globis': 'international',
  'Masters': 'international',
  'Nie_Weiping_Cup': 'international',
  'Go_Seigen_Cup': 'international',
  
  // International tournaments - Inter-country
  'IMeijin': 'international',
  'ITengen': 'international',
  'IAgon': 'international',
  'IOkage': 'international',
  'ISenko': 'international',
  'IRyusei': 'international',
  'CJSuperGo': 'international',
  'Ibero': 'international',
  'jastec': 'international',
  'AsianTV': 'international',
  'BC': 'international',
  'Chunlan': 'international',
  'CJKMeijin': 'international',
  'CJShuko': 'international',
  'CJGoExchange': 'international',
  'Tianfu': 'international',
  'WC': 'international',
  
  // Player collections
  'Cho_Chikun': 'players',
  'Players': 'players',
  'Go_Seigen': 'players',
  'Takagawa': 'players',
  'Shusai': 'players',
  'Shusaku': 'players',
  'Dosaku': 'players',
  'AlphaGo': 'players',
  'ancient': 'players',
  'people': 'players',
  
  // Special Collections
  'Hoensha': 'special',
  'handicap': 'special',
  'other_sizes': 'special',
  'unusual': 'special',
  'training': 'special'
};

// Base path for all game files
const basePath = process.env.PUBLIC_URL || '';

// Cache for SGF files
const sgfCache: Record<string, string> = {};

// Get a list of all tournaments from a specific category
export const getTournamentsByCategory = async (category: string): Promise<Tournament[]> => {
  try {
    // In a real implementation, this would fetch data from the server
    // For now, we'll return a static list based on the category
    const tournaments: Tournament[] = [];
    
    // Get all tournaments that belong to this category
    Object.entries(tournamentCategories).forEach(([id, cat]) => {
      if (cat === category) {
        tournaments.push({
          id,
          name: formatTournamentName(id),
          path: `${basePath}/games/${id}`
        });
      }
    });
    
    return tournaments.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
};

// Get all tournaments
export const getAllTournaments = async (): Promise<Tournament[]> => {
  try {
    const tournaments: Tournament[] = [];
    
    Object.keys(tournamentCategories).forEach(id => {
      tournaments.push({
        id,
        name: formatTournamentName(id),
        path: `${basePath}/games/${id}`
      });
    });
    
    return tournaments.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching all tournaments:', error);
    return [];
  }
};

// Format tournament name for display (convert underscores to spaces, etc.)
const formatTournamentName = (id: string): string => {
  return id.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
};

// Function to preload SGF files for a tournament
export const preloadTournamentGames = async (tournamentPath: string): Promise<void> => {
  try {
    const games = await parseGameIndex(tournamentPath);
    
    // Only preload the first few games to avoid overwhelming the browser
    const gamesToPreload = games.slice(0, 5);
    
    // Load SGF files in parallel
    await Promise.all(gamesToPreload.map(async (game) => {
      try {
        // Check if already cached
        if (!sgfCache[game.path]) {
          const sgfContent = await loadSgfByPath(game.path);
          // Cache is automatically handled in loadSgfByPath
          console.log(`Preloaded SGF file: ${game.path}`);
        }
      } catch (error) {
        console.warn(`Error preloading SGF file ${game.path}:`, error);
      }
    }));
    
    console.log(`Preloaded ${gamesToPreload.length} games for ${tournamentPath}`);
  } catch (error) {
    console.error('Error preloading tournament games:', error);
  }
};

// Function to clear cache to free up memory
export const clearSgfCache = (): void => {
  const cacheSize = Object.keys(sgfCache).length;
  Object.keys(sgfCache).forEach(key => {
    delete sgfCache[key];
  });
  console.log(`Cleared SGF cache (${cacheSize} items)`);
};

// Load a SGF file by path
export const loadSgfByPath = async (path: string): Promise<string> => {
  try {
    // Return from cache if available
    if (sgfCache[path]) {
      console.log(`Loading SGF from cache: ${path}`);
      return sgfCache[path];
    }
    
    console.log(`Fetching SGF file: ${path}`);
    let response = await fetch(path);
    
    // If the direct path fails, try alternative paths
    if (!response.ok) {
      console.warn(`Failed to load SGF file directly from ${path}, trying alternatives...`);
      
      // Try different path variations
      const pathVariations = [
        path,
        // Remove leading slash if present
        path.startsWith('/') ? path.substring(1) : '/' + path,
        // Try with public URL prefix
        `${process.env.PUBLIC_URL}${path}`,
        // Try fixing relative paths
        path.replace(/^\.\//, ''),
        // Fix double slashes
        path.replace(/\/\//g, '/'),
        // Try with absolute path from root
        `/${path.split('/').filter(Boolean).join('/')}`
      ];
      
      // Try each path variation
      for (const altPath of pathVariations) {
        if (altPath === path) continue; // Skip the original path
        
        try {
          console.log(`Trying alternative path: ${altPath}`);
          response = await fetch(altPath);
          if (response.ok) {
            console.log(`Successfully loaded SGF file from alternative path: ${altPath}`);
            break;
          }
        } catch (e) {
          console.warn(`Failed to load from alternative path: ${altPath}`);
        }
      }
      
      // If we still couldn't load, throw error
      if (!response.ok) {
        throw new Error(`Failed to load SGF file: ${response.status} ${response.statusText}`);
      }
    }
    
    const sgfContent = await response.text();
    
    // Validate SGF content
    if (!sgfContent || !sgfContent.trim().startsWith('(')) {
      throw new Error('Invalid SGF format: File doesn\'t start with "("');
    }
    
    // Store in cache
    sgfCache[path] = sgfContent;
    
    return sgfContent;
  } catch (error) {
    console.error('Error loading SGF file:', error);
    throw error;
  }
};

// Parse tournament index HTML to extract games
export const parseGameIndex = async (tournamentPath: string): Promise<GameInfo[]> => {
  try {
    const response = await fetch(`${tournamentPath}/index.html`);
    if (!response.ok) {
      throw new Error(`Failed to load tournament index: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract game information from the HTML table
    const games: GameInfo[] = [];
    const tournamentName = doc.querySelector('h1')?.textContent || '';
    const tournamentId = tournamentPath.split('/').pop() || '';
    
    // Process all tables in the document
    const tables = doc.querySelectorAll('table');
    
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
      const table = tables[tableIndex];
      const rows = table.querySelectorAll('tr');
      
      if (rows.length <= 1) continue; // Skip tables with just header or empty
      
      // Get table headers to determine column meanings
      const headerRow = rows[0];
      const headers = Array.from(headerRow.querySelectorAll('th')).map(th => 
        th.textContent?.trim().toLowerCase() || ''
      );
      
      // Determine column indices for key data
      const dateColIndex = headers.findIndex(h => h.includes('date') || h.includes('year'));
      const blackColIndex = headers.findIndex(h => h.includes('black'));
      const whiteColIndex = headers.findIndex(h => h.includes('white'));
      const resultColIndex = headers.findIndex(h => h.includes('result'));
      const sgfColIndex = headers.findIndex(h => h.includes('sgf'));
      
      // If no specific column found for players, look for winner/opponent pattern
      const winnerColIndex = blackColIndex === -1 ? headers.findIndex(h => h.includes('winner')) : -1;
      const opponentColIndex = whiteColIndex === -1 ? headers.findIndex(h => h.includes('opponent')) : -1;
      
      // Process each data row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 2) continue; // Skip rows with insufficient cells
        
        // Extract data based on detected column positions
        let date = '';
        let players: string[] = [];
        let result = '';
        let gameLinks: HTMLAnchorElement[] = [];
        
        // Extract date
        if (dateColIndex >= 0 && dateColIndex < cells.length) {
          date = cells[dateColIndex].textContent?.trim() || '';
        }
        
        // Extract players
        if (blackColIndex >= 0 && whiteColIndex >= 0 && 
            blackColIndex < cells.length && whiteColIndex < cells.length) {
          // Black and white player format
          const black = cells[blackColIndex].textContent?.trim() || '';
          const white = cells[whiteColIndex].textContent?.trim() || '';
          players = [black, white];
        } else if (winnerColIndex >= 0 && opponentColIndex >= 0 && 
                  winnerColIndex < cells.length && opponentColIndex < cells.length) {
          // Winner and opponent format
          const winner = cells[winnerColIndex].textContent?.trim() || '';
          const opponent = cells[opponentColIndex].textContent?.trim() || '';
          players = [winner, opponent];
        }
        
        // Extract result
        if (resultColIndex >= 0 && resultColIndex < cells.length) {
          result = cells[resultColIndex].textContent?.trim() || '';
        }
        
        // Extract SGF links
        if (sgfColIndex >= 0 && sgfColIndex < cells.length) {
          // Links in the SGF column
          gameLinks = Array.from(cells[sgfColIndex].querySelectorAll('a'));
        } else {
          // Look for links in any cell
          for (let j = 0; j < cells.length; j++) {
            const cellLinks = cells[j].querySelectorAll('a');
            if (cellLinks.length > 0) {
              gameLinks = Array.from(cellLinks).filter(link => {
                const href = link.getAttribute('href') || '';
                return href.endsWith('.sgf');
              });
              if (gameLinks.length > 0) break;
            }
          }
        }
        
        // Process each game link
        for (let j = 0; j < gameLinks.length; j++) {
          const link = gameLinks[j];
          const gameNumber = link.textContent?.trim() || `Game ${j+1}`;
          const sgfPath = link.getAttribute('href') || '';
          
          if (sgfPath && sgfPath.endsWith('.sgf')) {
            // Determine the title based on table content
            let title = '';
            
            // Try to extract a sensible title from the first few cells
            for (let k = 0; k < Math.min(cells.length, 3); k++) {
              const cellText = cells[k].textContent?.trim() || '';
              if (cellText && !cellText.includes('sgf') && cellText !== gameNumber) {
                if (title) title += ' - ';
                title += cellText;
              }
            }
            
            // Fallback title if we couldn't extract one
            if (!title) {
              title = `${tournamentName} (${date || 'Unknown date'}) - ${gameNumber}`;
            }
            
            games.push({
              id: `${tournamentId}-${date}-${j}`,
              tournament: tournamentName,
              title: title,
              players: players,
              date: date,
              result: result,
              path: `${tournamentPath}/${sgfPath}`
            });
          }
        }
      }
    }
    
    return games;
  } catch (error) {
    console.error('Error parsing game index:', error);
    return [];
  }
};

// Search for games by player name
export const searchGamesByPlayer = async (playerName: string): Promise<GameInfo[]> => {
  try {
    // In a real implementation, this would search the server or a prebuilt index
    // For now, this is a placeholder
    const tournaments = await getAllTournaments();
    const results: GameInfo[] = [];
    
    for (const tournament of tournaments) {
      try {
        const games = await parseGameIndex(tournament.path);
        const matchingGames = games.filter(game => 
          game.players.some(player => 
            player.toLowerCase().includes(playerName.toLowerCase())
          )
        );
        
        results.push(...matchingGames);
      } catch (e) {
        // Skip tournaments that fail to parse
        console.warn(`Skipping tournament ${tournament.id}:`, e);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};

// Get tournaments by subcategory
export const getTournamentsBySubcategory = async (categoryId: string, subcategoryId: string): Promise<Tournament[]> => {
  try {
    const category = mainCategories.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    const subcategory = category.subcategories?.find(subcat => subcat.id === subcategoryId);
    if (!subcategory) return [];
    
    const tournamentIds = subcategory.tournaments;
    const tournaments: Tournament[] = [];
    
    for (const id of tournamentIds) {
      tournaments.push({
        id,
        name: formatTournamentName(id),
        path: `${basePath}/games/${id}`,
        description: subcategory.description
      });
    }
    
    return tournaments.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error fetching tournaments for subcategory ${subcategoryId}:`, error);
    return [];
  }
};

// Get all subcategories
export const getAllSubcategories = (): {categoryId: string, subcategory: TournamentSubcategory}[] => {
  const allSubcategories: {categoryId: string, subcategory: TournamentSubcategory}[] = [];
  
  mainCategories.forEach(category => {
    category.subcategories?.forEach(subcategory => {
      allSubcategories.push({
        categoryId: category.id,
        subcategory
      });
    });
  });
  
  return allSubcategories;
}; 