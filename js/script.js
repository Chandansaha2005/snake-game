
// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 50;
let gameLoop;
let score = 0;
let gridSize = 20;
let gameActive = false;
let gamePaused = false;
let highScores = [];

// DOM elements
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const highScoresScreen = document.getElementById('high-scores-screen');
const scoresList = document.getElementById('scores-list');
const themeToggle = document.getElementById('theme-toggle');

// Buttons
const playBtn = document.getElementById('play-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const highScoresBtn = document.getElementById('high-scores-btn');
const backBtn = document.getElementById('back-btn');
const quitBtn = document.getElementById('quit-btn');

// Mobile controls
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Initialize the game
function init() {
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load high scores from local storage
    loadHighScores();

    // Set up event listeners
    setupEventListeners();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.checked = true;
    }

    // Show start screen
    showScreen(startScreen);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;

    // Adjust grid size based on canvas size
    gridSize = Math.floor(size / 30);

    // If game is active, redraw
    if (gameActive && !gamePaused) {
        drawGame();
    }
}

function setupEventListeners() {
    // Game control buttons
    playBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', resumeGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', startGame);
    mainMenuBtn.addEventListener('click', () => showScreen(startScreen));
    highScoresBtn.addEventListener('click', () => showScreen(highScoresScreen));
    backBtn.addEventListener('click', () => showScreen(startScreen));
    quitBtn.addEventListener('click', () => showScreen(startScreen));

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Mobile controls
    upBtn.addEventListener('click', () => changeDirection('up'));
    downBtn.addEventListener('click', () => changeDirection('down'));
    leftBtn.addEventListener('click', () => changeDirection('left'));
    rightBtn.addEventListener('click', () => changeDirection('right'));

    // Theme toggle
    themeToggle.addEventListener('change', toggleTheme);
}

function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
}

function showScreen(screen) {
    // Hide all screens
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    highScoresScreen.classList.add('hidden');

    // Show the requested screen
    screen.classList.remove('hidden');

    // If showing high scores, update the list
    if (screen === highScoresScreen) {
        updateHighScoresList();
    }

    // If showing start screen, stop the game
    if (screen === startScreen) {
        stopGame();
    }
}

function startGame() {
    // Reset game state
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreDisplay.textContent = score;

    // Generate food
    generateFood();

    // Hide all screens
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    highScoresScreen.classList.add('hidden');

    // Start game loop
    gameActive = true;
    gamePaused = false;
    gameLoop = setInterval(gameStep, gameSpeed);
}

function stopGame() {
    gameActive = false;
    clearInterval(gameLoop);
}

function pauseGame() {
    if (gameActive && !gamePaused) {
        gamePaused = true;
        clearInterval(gameLoop);
        showScreen(pauseScreen);
    }
}

function resumeGame() {
    if (gameActive && gamePaused) {
        gamePaused = false;
        pauseScreen.classList.add('hidden');
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

function togglePause() {
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function restartGame() {
    stopGame();
    startGame();
}

function gameStep() {
    // Update direction
    direction = nextDirection;

    // Move snake
    moveSnake();

    // Check for collisions
    if (checkCollision()) {
        gameOver();
        return;
    }

    // Check if food is eaten
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    }

    // Draw game
    drawGame();
}

function moveSnake() {
    // Create new head based on direction
    const head = { ...snake[0] };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Add new head to snake
    snake.unshift(head);

    // Remove tail unless food was eaten
    snake.pop();
}

function checkCollision() {
    const head = snake[0];
    const canvasGridWidth = Math.floor(canvas.width / gridSize);
    const canvasGridHeight = Math.floor(canvas.height / gridSize);

    // Check wall collision
    if (head.x < 0 || head.y < 0 || head.x >= canvasGridWidth || head.y >= canvasGridHeight) {
        return true;
    }

    // Check self collision (start from index 1 to avoid checking head against itself)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function generateFood() {
    const canvasGridWidth = Math.floor(canvas.width / gridSize);
    const canvasGridHeight = Math.floor(canvas.height / gridSize);

    // Generate random position
    let newFood;
    let foodOnSnake;

    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * canvasGridWidth),
            y: Math.floor(Math.random() * canvasGridHeight)
        };

        // Check if food is on snake
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);

    food = newFood;
}

function eatFood() {
    // Add new segment to snake (will be handled in next move)
    snake.push({});

    // Update score
    score += 10;
    scoreDisplay.textContent = score;

    // Generate new food
    generateFood();

    // Increase speed slightly
    if (gameSpeed > 500) {
        gameSpeed -= 1;
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;

        ctx.fillStyle = i === 0 ?
            getComputedStyle(document.documentElement).getPropertyValue('--secondary') :
            getComputedStyle(document.documentElement).getPropertyValue('--primary');

        ctx.shadowColor = i === 0 ?
            getComputedStyle(document.documentElement).getPropertyValue('--secondary') :
            getComputedStyle(document.documentElement).getPropertyValue('--primary');

        ctx.shadowBlur = i === 0 ? 10 : 5;

        // Draw rounded rectangle for snake segments
        const radius = i === 0 ? 5 : 3;
        ctx.beginPath();
        ctx.roundRect(x, y, gridSize, gridSize, radius);
        ctx.fill();
    }

    // Reset shadow for food
    ctx.shadowBlur = 0;

    // Draw food
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;

    // Create gradient for food
    const gradient = ctx.createRadialGradient(
        foodX + gridSize / 2, foodY + gridSize / 2, 0,
        foodX + gridSize / 2, foodY + gridSize / 2, gridSize / 2
    );

    gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--tertiary'));
    gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--accent'));

    ctx.fillStyle = gradient;
    ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--tertiary');
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(foodX + gridSize / 2, foodY + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function gameOver() {
    stopGame();
    finalScoreDisplay.textContent = score;

    // Add score to high scores
    addHighScore(score);

    // Show game over screen
    showScreen(gameOverScreen);
}

function handleKeyPress(e) {
    if (!gameActive) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            break;
        case ' ':
        case 'p':
        case 'P':
            togglePause();
            break;
        case 'r':
        case 'R':
            restartGame();
            break;
        case 'Escape':
            if (gamePaused) {
                showScreen(startScreen);
            } else {
                togglePause();
            }
            break;
    }
}

function changeDirection(newDirection) {
    // Prevent 180-degree turns
    if (
        (direction === 'up' && newDirection === 'down') ||
        (direction === 'down' && newDirection === 'up') ||
        (direction === 'left' && newDirection === 'right') ||
        (direction === 'right' && newDirection === 'left')
    ) {
        return;
    }

    nextDirection = newDirection;
}

function loadHighScores() {
    const savedScores = localStorage.getItem('snakeHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    } else {
        // Default high scores
        highScores = [
            { name: 'NEO', score: 200 },
            { name: 'TRINITY', score: 150 },
            { name: 'CIPHER', score: 100 },
            { name: 'GHOST', score: 80 },
            { name: 'PIXEL', score: 50 }
        ];
        saveHighScores();
    }
}

function saveHighScores() {
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
}

function addHighScore(newScore) {
    // Generate a random cyberpunk name
    const names = ['NEO', 'CIPHER', 'GHOST', 'PIXEL', 'NOVA', 'GLITCH', 'ECHO', 'VOID', 'FLUX', 'BYTE'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    // Add new score
    highScores.push({ name: randomName, score: newScore });

    // Sort scores (highest first)
    highScores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }

    // Save to local storage
    saveHighScores();
}

function updateHighScoresList() {
    // Clear list
    scoresList.innerHTML = '';

    // Add scores
    highScores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'score-item';
        li.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score}</span>
                `;
        scoresList.appendChild(li);
    });
}

// Start the game
init();