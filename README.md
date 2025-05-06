# GoSei | AI-Kifu - Go Game Analysis Tool

GoSei | AI-Kifu is an open-source web application dedicated to the Go community for reading, visualizing, and analyzing Go game records (kifu) in both SGF (Smart Game Format) and traditional Japanese kifu format.

## Latest Updates (v1.0.1)

- Improved mobile experience with 5 games per page on smaller screens
- Updated UI with consistent dark grey button styling
- See [VERSION.md](VERSION.md) for complete version history

## Live Demo

Check out the live deployment of GoSei | AI-Kifu at [https://kifu.gosei.xyz/](https://kifu.gosei.xyz/)

## About the Project

GoSei | AI-Kifu is built as a contribution to the Go community, providing free access to both game visualization tools and an extensive library of historical games. The application features thousands of professional games sourced from the [comprehensive SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer.

The project is powered by the [Beaver Foundation](https://beaver.foundation), supporting open-source development for the Go community.

## Features

- 📋 Support for both SGF and Japanese kifu formats
- 🎮 Interactive Go board visualization
- ⏩ Move-by-move navigation through games
- 📝 Display of game information and move comments
- 📤 File upload and text paste functionality
- 📚 Extensive game library with over 66,000 professional games
- 🔍 Advanced search and filtering options
- 📱 Responsive design for desktop and mobile
  - Optimized UI for small screens with appropriate game results pagination
  - Mobile-friendly navigation and hidden UI elements to save space
- ⚡ Optimized performance with caching and React memoization

## Screenshots

![Main Game Viewer](/Examples/3_game_preview.jpg)
*The main game viewer interface showing an interactive Go board with move history and navigation controls*

![Game Library](/Examples/2_game_lib.jpg)
*Browse thousands of professional games organized by tournaments, players, and categories*

![SGF File Upload](/Examples/1_game_upload.jpg)
*Upload your own SGF files or paste Japanese kifu format for instant visualization*

## Game Library

The GoSei | AI-Kifu game library includes thousands of professional Go games, organized into categories:

- **Major Tournaments**: Meijin, Honinbo, Judan, Tengen, Kisei, Gosei, Oza, and historical title matches
- **Other Japanese Tournaments**: Fast games, women's tournaments, special formats, and sponsored events
- **International Tournaments**: Major international events and cross-country competitions
- **Player Collections**: Game collections of famous professional players like Cho Chikun, Go Seigen, and more
- **Special Collections**: Unusual games, different board sizes, and historical collections

All game data is sourced from the [SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer at CWI.

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: CSS
- **Deployment**: Netlify
- **Testing**: Jest, React Testing Library

## Performance Optimizations

GoSei | AI-Kifu includes several performance optimizations to ensure smooth and responsive user experience:

### Game Library Organization
- Hierarchical category structure for intuitive navigation
- Games organized into subcategories for easier browsing
- Efficient search across the entire game database

### Caching Mechanisms
- SGF files are cached after first load to prevent redundant network requests
- Game lists are cached by tournament to reduce API calls
- Preloading of game data for faster navigation

### React Optimizations
- Component memoization using React.memo to prevent unnecessary re-renders
- useCallback and useMemo hooks for optimized rendering of the Go board
- Efficient state management for smooth interaction

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/AI-Kifu.git
   cd AI-Kifu
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up game data:
   ```
   npm run setup
   ```

4. Start the development server:
   ```
   npm start
   ```
   
   Or to run setup and start in one command:
   ```
   npm run start-with-copy
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the application for production:

```
npm run build-with-copy
```

The build artifacts will be stored in the `build/` directory.

## Usage

### Uploading SGF Files

1. Click on the drop area or use the file browser to select an SGF file
2. The game will be loaded and displayed on the board

### Browsing the Game Library

1. Click on "Game Library" in the header
2. Browse games by category, subcategory, or tournament
3. Use pagination controls to navigate through multiple games
4. Search for specific games using the search bar
5. Click on a game to load and display it in the viewer

### Using Japanese Kifu Format

You can paste traditional Japanese kifu format directly into the text area. Example format:

```
# 棋譜（Japanese Kifu Format）
# 黒：Takemiya Masaki
# 白：Cho Chikun
# 日付: 1986-02-27
# 結果: 黒の中押し勝ち

1. 黒: Q16
2. 白: D4
3. 黒: Q4
...
```

The application will automatically convert this to SGF format for visualization.

### Navigating through the Game

- Use the navigation controls below the board to move through the game
- First/Last buttons jump to the beginning/end of the game
- Prev/Next buttons move one move at a time
- Comments for moves will be displayed when available

## Contributing

GoSei | AI-Kifu is an open-source project, and contributions are warmly welcomed! Whether you're fixing bugs, improving the UI, adding new features, or enhancing documentation, your help is appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Beaver Foundation](https://beaver.foundation) for supporting this open-source project
- [SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer for providing the game data
- [Netlify](https://www.netlify.com/) for their generous hosting and continuous deployment platform that powers our application
- The global Go/Baduk/Weiqi community that continues to preserve and share the rich history of this beautiful game
- Copyright © GoSei
