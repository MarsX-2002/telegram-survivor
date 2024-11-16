// Initialize game when everything is ready
window.addEventListener('load', () => {
    if (!window.game) {
        window.game = new Game();
        console.log('Game initialized');
    }
});

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Game state
        this.isRunning = false;
        this.score = 0;
        this.level = 1;
        this.lastTime = 0;
        this.enemies = [];
        this.powerups = [];
        
        // Initialize player
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height / 2;
        this.player = new Player(startX, startY);

        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.start();
        
        console.log('Game instance created successfully');
    }

    resizeCanvas() {
        // Get the game container dimensions
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }

    setupEventListeners() {
        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // Prevent default browser actions
            console.log('Key pressed:', e.key); // Debug log
            this.player.handleKeyDown(e.key);
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault(); // Prevent default browser actions
            console.log('Key released:', e.key); // Debug log
            this.player.handleKeyUp(e.key);
        });

        // Handle touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.player.setTarget(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.player.setTarget(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
        });

        // Handle mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.setTarget(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left mouse button
                const rect = this.canvas.getBoundingClientRect();
                this.player.setTarget(
                    e.clientX - rect.left,
                    e.clientY - rect.top
                );
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Focus canvas on click to ensure keyboard events work
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
            console.log('Game loop started');
        }
    }

    stop() {
        this.isRunning = false;
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch(side) {
            case 0: // top
                x = Math.random() * this.canvas.width;
                y = -30;
                break;
            case 1: // right
                x = this.canvas.width + 30;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 30;
                break;
            case 3: // left
                x = -30;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        this.enemies.push(new Enemy(x, y));
    }

    spawnPowerup() {
        const x = Math.random() * (this.canvas.width - 40) + 20;
        const y = Math.random() * (this.canvas.height - 40) + 20;
        this.powerups.push(new Powerup(x, y));
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('scoreValue').textContent = this.score;
    }

    updateLevel() {
        this.level++;
        document.getElementById('levelValue').textContent = this.level;
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw player
        this.player.update(deltaTime);
        this.player.draw(this.ctx);

        // Update and draw projectiles
        this.player.projectiles = this.player.projectiles.filter(projectile => {
            projectile.update(deltaTime);
            projectile.draw(this.ctx);
            return !projectile.isOffScreen(this.canvas.width, this.canvas.height);
        });

        // Spawn enemies
        if (Math.random() < 0.02 + (this.level * 0.005)) {
            this.spawnEnemy();
        }

        // Spawn powerups
        if (Math.random() < 0.002) {
            this.spawnPowerup();
        }

        // Update and draw enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime, this.player.x, this.player.y);
            enemy.draw(this.ctx);

            // Check collision with player
            if (enemy.checkCollision(this.player)) {
                this.player.takeDamage(10);
                return false;
            }

            // Check collision with projectiles
            for (let projectile of this.player.projectiles) {
                if (projectile.checkCollision(enemy)) {
                    enemy.takeDamage(projectile.damage);
                    if (enemy.health <= 0) {
                        this.updateScore(10);
                        if (this.score % 100 === 0) {
                            this.updateLevel();
                        }
                        return false;
                    }
                    return true;
                }
            }

            return true;
        });

        // Update and draw powerups
        this.powerups = this.powerups.filter(powerup => {
            powerup.update(deltaTime);
            powerup.draw(this.ctx);

            if (powerup.checkCollision(this.player)) {
                powerup.apply(this.player);
                return false;
            }

            return true;
        });

        // Check game over
        if (this.player.health <= 0) {
            this.stop();
            console.log('Game Over');
            return;
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
