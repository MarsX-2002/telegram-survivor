// Initialize Telegram Mini App
let tg = window.Telegram?.WebApp;

// Fallback for desktop testing
if (!tg) {
    tg = {
        ready: () => {},
        expand: () => {},
        isExpanded: true
    };
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game objects
        this.player = new Player(this, this.canvas.width / 2, this.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        
        // Game settings
        this.enemySpawnInterval = 1000;
        this.powerUpSpawnInterval = 10000;
        this.lastEnemySpawn = 0;
        this.lastPowerUpSpawn = 0;
        
        // Initialize controls
        this.setupControls();
        
        // Start game loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupControls() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            this.player.move(deltaX, deltaY);
            
            touchStartX = touchX;
            touchStartY = touchY;
        });

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left mouse button is pressed
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Move towards mouse position
                const deltaX = mouseX - this.player.x;
                const deltaY = mouseY - this.player.y;
                this.player.move(deltaX, deltaY);
            }
        });

        // Keyboard controls
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false
        };

        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastEnemySpawn >= this.enemySpawnInterval) {
            let x, y;
            const side = Math.floor(Math.random() * 4);
            
            switch(side) {
                case 0: // Top
                    x = Math.random() * this.canvas.width;
                    y = -30;
                    break;
                case 1: // Right
                    x = this.canvas.width + 30;
                    y = Math.random() * this.canvas.height;
                    break;
                case 2: // Bottom
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + 30;
                    break;
                case 3: // Left
                    x = -30;
                    y = Math.random() * this.canvas.height;
                    break;
            }
            
            this.enemies.push(new Enemy(this, x, y));
            this.lastEnemySpawn = now;
            
            // Increase difficulty
            this.enemySpawnInterval = Math.max(200, 1000 - (this.level * 50));
        }
    }

    spawnPowerUp() {
        const now = Date.now();
        if (now - this.lastPowerUpSpawn >= this.powerUpSpawnInterval) {
            const types = ['speed', 'damage', 'multishot', 'health'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const x = Math.random() * (this.canvas.width - 60) + 30;
            const y = Math.random() * (this.canvas.height - 60) + 30;
            
            this.powerUps.push(new PowerUp(this, x, y, type));
            this.lastPowerUpSpawn = now;
        }
    }

    update() {
        // Update game objects
        this.player.update();
        
        // Update enemies
        this.enemies = this.enemies.filter(enemy => !enemy.dead);
        this.enemies.forEach(enemy => enemy.update());
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => !projectile.hit && 
            projectile.x >= 0 && projectile.x <= this.canvas.width &&
            projectile.y >= 0 && projectile.y <= this.canvas.height);
        this.projectiles.forEach(projectile => projectile.update());
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected);
        
        // Spawn new objects
        this.spawnEnemy();
        this.spawnPowerUp();
        
        // Check collisions
        this.checkCollisions();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game objects
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.player.draw(this.ctx);
        
        // Draw UI
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Level: ${this.level}`, 10, 60);
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click or Tap to Start', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Click or Tap to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
    }

    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.gameOver) {
            // Update game objects
            this.update();

            // Draw game objects
            this.draw();
        }

        requestAnimationFrame((time) => this.animate(time));
    }

    checkCollisions() {
        // Check weapon hits on enemies
        this.projectiles.forEach((projectile, projectileIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.detectCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage);
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.updateScore(10);
                    }
                    this.projectiles.splice(projectileIndex, 1);
                }
            });
        });

        // Check enemy collisions with player
        this.enemies.forEach((enemy) => {
            if (this.detectCollision(enemy, this.player)) {
                this.gameOver = true;
                this.showGameOver();
            }
        });

        // Check power-up collisions with player
        this.powerUps.forEach((powerUp, powerUpIndex) => {
            if (this.detectCollision(powerUp, this.player)) {
                this.player.applyPowerUp(powerUp.type);
                this.powerUps.splice(powerUpIndex, 1);
            }
        });
    }

    detectCollision(obj1, obj2) {
        return Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y) < (obj1.radius + obj2.radius);
    }

    showGameOver() {
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.player = new Player(this, this.canvas.width / 2, this.canvas.height / 2);
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('score-value').textContent = '0';
        document.getElementById('level-value').textContent = '1';
    }
}

let gameInstance = null;

function initGame() {
    // Prevent multiple initializations
    if (gameInstance) {
        console.log('Game already initialized');
        return;
    }

    try {
        console.log('Waiting for DOM and Telegram WebApp...');
        
        // Function to check if everything is ready
        const checkReady = () => {
            if (document.readyState === 'complete' && window.Telegram && window.Telegram.WebApp) {
                console.log('DOM and Telegram WebApp ready, initializing game...');
                
                // Configure Telegram WebApp
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                
                // Set theme colors
                const isDarkTheme = window.Telegram.WebApp.colorScheme === 'dark';
                document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
                
                // Initialize game
                gameInstance = new Game();
                
                // Handle visibility changes
                window.Telegram.WebApp.onEvent('viewportChanged', () => {
                    if (gameInstance) {
                        gameInstance.resizeCanvas();
                    }
                });
            } else {
                console.log('Waiting for initialization...');
                setTimeout(checkReady, 100);
            }
        };

        // Start checking
        checkReady();
    } catch (error) {
        console.error('Error initializing game:', error);
        // Fallback to initialize without Telegram WebApp
        console.log('Falling back to standalone mode...');
        gameInstance = new Game();
    }
}

// Handle both Telegram WebApp and regular browser
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

// Start the game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
