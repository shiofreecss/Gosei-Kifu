import React, { useState, useEffect } from 'react';
import { 
  mainCategories, 
  Tournament, 
  getTournamentsByCategory, 
  getAllTournaments,
  GameInfo, 
  parseGameIndex,
  loadSgfByPath,
  preloadTournamentGames,
  TournamentCategory,
  TournamentSubcategory,
  getTournamentsBySubcategory,
  getAllSubcategories
} from '../utils/gameLibrary';
import './GameLibrary.css';

interface GameLibraryProps {
  onSelectGame: (sgfContent: string) => void;
}

const GameLibrary: React.FC<GameLibraryProps> = ({ onSelectGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Record<string, Tournament[]>>({});
  const [subcategoryTournaments, setSubcategoryTournaments] = useState<Record<string, Tournament[]>>({});
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGames, setFilteredGames] = useState<GameInfo[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage, setGamesPerPage] = useState(20);
  const [cachedGamesByTournament, setCachedGamesByTournament] = useState<Record<string, GameInfo[]>>({});
  
  // Add this effect to handle mobile screen size for games per page
  useEffect(() => {
    const handleResize = () => {
      // If window width is less than 768px (mobile), set games per page to 5
      if (window.innerWidth <= 768) {
        setGamesPerPage(5);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load all tournaments on component mount
  useEffect(() => {
    const loadAllTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all tournaments
        const allTournamentsData = await getAllTournaments();
        setAllTournaments(allTournamentsData);
        
        // Load tournaments by category
        const tournamentsByCategory: Record<string, Tournament[]> = {};
        
        // Initialize with empty arrays for each category
        mainCategories.forEach(category => {
          tournamentsByCategory[category.id] = [];
        });
        
        // Load each category's tournaments
        for (const category of mainCategories) {
          const categoryTournaments = await getTournamentsByCategory(category.id);
          tournamentsByCategory[category.id] = categoryTournaments;
        }
        
        setTournaments(tournamentsByCategory);
        
        // Initialize subcategory tournaments
        const subcategoryTours: Record<string, Tournament[]> = {};
        for (const category of mainCategories) {
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              const subcatId = `${category.id}_${subcategory.id}`;
              const subcatTournaments = await getTournamentsBySubcategory(category.id, subcategory.id);
              subcategoryTours[subcatId] = subcatTournaments;
              
              // Initialize this subcategory as expanded
              setExpandedSubcategories(prev => ({
                ...prev,
                [subcatId]: false
              }));
            }
          }
        }
        
        setSubcategoryTournaments(subcategoryTours);
        
        // Initialize all categories as expanded
        const initialExpandedState: Record<string, boolean> = {};
        mainCategories.forEach(category => {
          initialExpandedState[category.id] = true;
        });
        setExpandedCategories(initialExpandedState);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setError('Failed to load tournaments. Please try again later.');
        setLoading(false);
      }
    };
    
    loadAllTournaments();
  }, []);
  
  // Load games when tournament changes
  useEffect(() => {
    const loadGames = async () => {
      if (!selectedTournament) {
        setGames([]);
        setFilteredGames([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Reset to first page when changing tournaments
        setCurrentPage(1);
        
        // Check if games for this tournament are already cached
        if (cachedGamesByTournament[selectedTournament.id]) {
          setGames(cachedGamesByTournament[selectedTournament.id]);
          setFilteredGames(cachedGamesByTournament[selectedTournament.id]);
          setLoading(false);
          
          // Preload SGF files in the background for this tournament
          preloadTournamentGames(selectedTournament.path).catch(console.error);
          return;
        }
        
        const gameList = await parseGameIndex(selectedTournament.path);
        setGames(gameList);
        setFilteredGames(gameList);
        
        // Cache the game list for this tournament
        setCachedGamesByTournament(prev => ({
          ...prev,
          [selectedTournament.id]: gameList
        }));
        
        setLoading(false);
        
        // Preload SGF files in the background
        preloadTournamentGames(selectedTournament.path).catch(console.error);
      } catch (error) {
        console.error('Error loading games:', error);
        setError(`Failed to load games for ${selectedTournament.name}. Please try again later.`);
        setLoading(false);
      }
    };
    
    loadGames();
  }, [selectedTournament]);
  
  // Filter games when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGames(games);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = games.filter(game => 
        game.title.toLowerCase().includes(search) ||
        game.players.some(player => player.toLowerCase().includes(search)) ||
        game.date.toLowerCase().includes(search) ||
        game.result.toLowerCase().includes(search)
      );
      
      setFilteredGames(filtered);
    }
    
    // Reset to first page when filtering changes
    setCurrentPage(1);
  }, [searchTerm, games]);
  
  // Get current games to display based on pagination
  const getCurrentPageGames = () => {
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    return filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Handle tournament selection
  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setSearchTerm(''); // Clear search term when changing tournaments
  };
  
  // Handle game selection
  const handleGameSelect = async (game: GameInfo) => {
    try {
      setLoading(true);
      setError(null);
      
      const sgfContent = await loadSgfByPath(game.path);
      onSelectGame(sgfContent);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading SGF file:', error);
      setError(`Failed to load game file. Please try again later.`);
      setLoading(false);
    }
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Toggle subcategory expansion
  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSelectedTournament(null);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setSelectedTournament(null);
  };
  
  // Filtered tournaments based on selected category and subcategory
  const filteredTournaments = selectedSubcategory 
    ? subcategoryTournaments[`${selectedCategory}_${selectedSubcategory}`] || []
    : selectedCategory === 'all'
      ? allTournaments
      : tournaments[selectedCategory] || [];
  
  // Get games for current page
  const currentGames = getCurrentPageGames();
  
  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '15px',
        gap: '10px'
      }}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          &laquo; Prev
        </button>
        
        <span style={{ fontSize: '14px' }}>
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
        
        <div style={{
          marginLeft: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span className="games-per-page-text" style={{ fontSize: '14px' }}>Games per page:</span>
          <select
            value={gamesPerPage}
            onChange={(e) => {
              setGamesPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };
  
  // Render game list
  const renderGameList = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading games...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '20px', 
          borderRadius: '4px',
          color: '#c62828'
        }}>
          <p>{error}</p>
        </div>
      );
    }
    
    if (currentGames.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No games found. {searchTerm ? 'Try a different search term.' : ''}</p>
        </div>
      );
    }
    
    return (
      <div className="game-list">
        {currentGames.map(game => (
          <div 
            key={game.id}
            className="game-item"
            onClick={() => handleGameSelect(game)}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '8px' 
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                {game.title}
              </h3>
              <span style={{ 
                fontSize: '14px',
                color: '#777',
                fontWeight: '500'
              }}>
                {game.date}
              </span>
            </div>
            
            <div className="player-info" style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ 
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'black',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}></span>
                <span>{game.players[0] || 'Unknown'}</span>
              </div>
              <span style={{ color: '#999' }}>vs</span>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ 
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  border: '1px solid #ddd',
                  display: 'inline-block'
                }}></span>
                <span>{game.players[1] || 'Unknown'}</span>
              </div>
            </div>
            
            {game.result && (
              <div style={{ 
                color: '#555',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontWeight: '500' }}>Result:</span>
                <span>{game.result}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="game-library">
      <h2 className="game-library-header">
        Game Library
      </h2>
      
      <div className="game-library-container">
        {/* Left sidebar: Categories and Tournaments */}
        <div className="game-library-sidebar">
          {/* Category Selection at the top */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '10px',
              color: '#555'
            }}>
              View
            </h3>
            <div className="category-buttons" style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'selected' : ''}
              >
                All Tournaments
              </button>
              {mainCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'selected' : ''}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tournament list with expandable categories */}
          <div className="tournament-list" style={{ marginBottom: '15px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '10px',
              color: '#555',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Tournaments</span>
              {loading && (
                <span style={{ fontSize: '12px', color: '#777' }}>
                  Loading...
                </span>
              )}
            </h3>
            
            {selectedCategory === 'all' ? (
              // Display tournaments organized by categories
              mainCategories.map(category => (
                <div key={category.id} style={{ marginBottom: '10px' }}>
                  <div 
                    onClick={() => toggleCategoryExpansion(category.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '5px'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                    <span style={{ transform: expandedCategories[category.id] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▶
                    </span>
                  </div>
                  
                  {expandedCategories[category.id] && (
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      paddingLeft: '10px'
                    }}>
                      {/* Display category description */}
                      {category.description && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          margin: '0 0 8px 0',
                          padding: '0 4px'
                        }}>
                          {category.description}
                        </div>
                      )}
                      
                      {/* Display subcategories */}
                      {category.subcategories && category.subcategories.map(subcategory => (
                        <div key={subcategory.id} style={{ marginBottom: '8px' }}>
                          <div 
                            onClick={() => toggleSubcategoryExpansion(`${category.id}_${subcategory.id}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginBottom: '4px',
                              fontSize: '14px'
                            }}
                          >
                            <span>{subcategory.name}</span>
                            <span style={{ 
                              transform: expandedSubcategories[`${category.id}_${subcategory.id}`] ? 'rotate(90deg)' : 'none', 
                              transition: 'transform 0.2s',
                              fontSize: '10px'
                            }}>
                              ▶
                            </span>
                          </div>
                          
                          {expandedSubcategories[`${category.id}_${subcategory.id}`] && (
                            <div style={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              paddingLeft: '15px'
                            }}>
                              {subcategoryTournaments[`${category.id}_${subcategory.id}`]?.map(tournament => (
                                <div
                                  key={tournament.id}
                                  onClick={() => handleTournamentSelect(tournament)}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: selectedTournament?.id === tournament.id ? '#e3f2fd' : 'transparent',
                                    borderLeft: selectedTournament?.id === tournament.id ? '3px solid #2196F3' : '3px solid transparent',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.15s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (selectedTournament?.id !== tournament.id) {
                                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (selectedTournament?.id !== tournament.id) {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  {tournament.name}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div 
                            onClick={() => handleSubcategorySelect(category.id, subcategory.id)}
                            style={{
                              padding: '4px 15px',
                              color: `${category.id}_${subcategory.id}` === `${selectedCategory}_${selectedSubcategory}` ? '#2196F3' : '#777',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-block',
                              marginTop: '2px',
                              borderRadius: '4px',
                              backgroundColor: `${category.id}_${subcategory.id}` === `${selectedCategory}_${selectedSubcategory}` ? '#e3f2fd' : 'transparent'
                            }}
                          >
                            View All {subcategory.name}
                          </div>
                        </div>
                      ))}
                      
                      <div 
                        onClick={() => handleCategorySelect(category.id)}
                        style={{
                          padding: '6px 10px',
                          color: selectedCategory === category.id && !selectedSubcategory ? '#2196F3' : '#555',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-block',
                          marginTop: '5px',
                          borderRadius: '4px',
                          backgroundColor: selectedCategory === category.id && !selectedSubcategory ? '#e3f2fd' : 'transparent',
                          fontWeight: '500'
                        }}
                      >
                        View All {category.name}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : selectedSubcategory ? (
              // Display only the selected subcategory's tournaments
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {/* Back button */}
                <div
                  onClick={() => setSelectedSubcategory(null)}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: '#f0f0f0',
                    color: '#555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Category
                </div>
                
                {/* Display current location */}
                <div style={{
                  padding: '6px 10px',
                  backgroundColor: '#e3f2fd',
                  color: '#0d47a1',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}>
                  <strong>
                    {mainCategories.find(cat => cat.id === selectedCategory)?.name} / 
                    {mainCategories.find(cat => cat.id === selectedCategory)?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name}
                  </strong>
                </div>
                
                {/* Display selected subcategory description */}
                {mainCategories.find(cat => cat.id === selectedCategory)?.subcategories?.find(sub => sub.id === selectedSubcategory)?.description && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    margin: '0 0 12px 0',
                    padding: '8px 10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    lineHeight: '1.4'
                  }}>
                    {mainCategories.find(cat => cat.id === selectedCategory)?.subcategories?.find(sub => sub.id === selectedSubcategory)?.description}
                  </div>
                )}
                
                {filteredTournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    onClick={() => handleTournamentSelect(tournament)}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: selectedTournament?.id === tournament.id ? '#e3f2fd' : 'white',
                      borderLeft: selectedTournament?.id === tournament.id ? '3px solid #2196F3' : '3px solid transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTournament?.id !== tournament.id) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTournament?.id !== tournament.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {tournament.name}
                  </div>
                ))}
              </div>
            ) : (
              // Display only the selected category's subcategories
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {/* Back button */}
                <div
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: '#f0f0f0',
                    color: '#555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to All Categories
                </div>
                
                {/* Display selected category description */}
                {mainCategories.find(cat => cat.id === selectedCategory)?.description && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    margin: '0 0 12px 0',
                    padding: '8px 10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    lineHeight: '1.4'
                  }}>
                    {mainCategories.find(cat => cat.id === selectedCategory)?.description}
                  </div>
                )}
                
                {/* Display subcategories as cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {mainCategories.find(cat => cat.id === selectedCategory)?.subcategories?.map(subcategory => (
                    <div
                      key={subcategory.id}
                      onClick={() => handleSubcategorySelect(selectedCategory, subcategory.id)}
                      style={{
                        padding: '12px 15px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        border: '1px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#333' }}>{subcategory.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {subcategoryTournaments[`${selectedCategory}_${subcategory.id}`]?.length || 0} tournaments
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Show all tournaments in this category */}
                <div style={{ marginTop: '10px', borderTop: '1px solid #eaeaea', paddingTop: '15px' }}>
                  <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#555' }}>All Tournaments in this Category</h4>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {filteredTournaments.map(tournament => (
                      <div
                        key={tournament.id}
                        onClick={() => handleTournamentSelect(tournament)}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: selectedTournament?.id === tournament.id ? '#e3f2fd' : 'transparent',
                          borderLeft: selectedTournament?.id === tournament.id ? '3px solid #2196F3' : '3px solid transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTournament?.id !== tournament.id) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTournament?.id !== tournament.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {tournament.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel: Games list */}
        <div className="game-library-content">
          {selectedTournament ? (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px',
                flexWrap: 'wrap'
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  margin: 0,
                  color: '#555'
                }}>
                  Games - {selectedTournament.name}
                </h3>
                
                <div className="search-container" style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  border: '1px solid #e0e0e0',
                  width: '250px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '0 10px',
                      width: '90%',
                      backgroundColor: 'transparent',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div className="game-list">
                  {renderGameList()}
                </div>
                
                <div className="pagination">
                  {renderPagination()}
                </div>
              </div>
              
              {/* Note for users */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e8f4fd', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#0277bd',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Click on any game to view it in a separate game board viewer
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#777',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px dashed #ddd'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3 style={{ 
                fontSize: '18px', 
                margin: '15px 0 10px',
                color: '#555'
              }}>
                Select a tournament
              </h3>
              <p style={{ margin: 0 }}>
                Choose a tournament from the left panel to view available games
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px 15px', 
          backgroundColor: '#fdedeb', 
          color: '#e74c3c',
          borderRadius: '6px',
          fontSize: '14px',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default GameLibrary; 