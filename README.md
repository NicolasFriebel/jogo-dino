# Evade Extinction

Evade Extinction is a 2D arcade-style survival game where you control a dino trying to outrun falling meteors. 
Features an 8-bit design style, celebrating classic games together with classic design practices.
It's an allusion to surviving and thriving on the jungle that is the market

# Features

- Responsive Air Control: Variable jump heights, and dive mechanics.
- Meteors.
- parallex terrain (to be added).

# Installation and Usage

1. Clone the repository:

`git clone https://github.com/eduardogimenis/jogo-dino.git`

2. Navigate to the project directory:

`cd jogo-dino`

3. Initiate a local server:

`python3 -m http.server 8000`

4. Open the internal server:

`http://localhost:8000`

# Directory Structure

Current `dev` branch:

```
project-root/
├── index.html                # Main entry point for the game
├── style.css                 # Game styles
├── src/                      # JavaScript source files
│   ├── game.js               # Main game logic
│   ├── entities.js           # Entity definitions and player control
│   ├── assets.js             # Asset management
│   ├── config.js             # Game settings
│   └── input.js              # Input handling
├── images/                   # Game assets (images, sounds, etc.)
└── README.md                 # Project description and setup instructions
```

