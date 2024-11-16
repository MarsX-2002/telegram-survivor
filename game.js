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
        console.log('Game stopped');
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch(side) {
            case 0: // top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }

        const enemy = new Enemy(x, y, 20 + this.level * 2); // Size increases with level
        this.enemies.push(enemy);
    }

    spawnPowerup() {
        if (Math.random() < 0.01) { // 1% chance per frame
            const x = Math.random() * (this.canvas.width - 40) + 20;
            const y = Math.random() * (this.canvas.height - 40) + 20;
            const type = Math.floor(Math.random() * 4); // 0: speed, 1: damage, 2: multishot, 3: health
            this.powerups.push(new Powerup(x, y, type));
        }
    }

    update(deltaTime) {
        // Update player
        this.player.update(deltaTime);

        // Spawn enemies
        if (Math.random() < 0.02 + (this.level * 0.005)) { // Increase spawn rate with level
            this.spawnEnemy();
        }

        // Spawn powerups
        this.spawnPowerup();

        // Update enemies
        this.enemies.forEach((enemy, index) => {
            enemy.update(deltaTime, this.player);
            
            // Check collision with player
            if (this.player.checkCollision(enemy)) {
                this.player.takeDamage(10);
                this.enemies.splice(index, 1);
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });

        // Update powerups
        this.powerups.forEach((powerup, index) => {
            if (this.player.checkCollision(powerup)) {
                powerup.apply(this.player);
                this.powerups.splice(index, 1);
                this.score += 50;
            }
        });

        // Update projectiles
        this.player.projectiles.forEach((projectile, pIndex) => {
            projectile.update(deltaTime);
            
            // Check collision with enemies
            this.enemies.forEach((enemy, eIndex) => {
                if (projectile.checkCollision(enemy)) {
                    enemy.takeDamage(projectile.damage);
                    this.player.projectiles.splice(pIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(eIndex, 1);
                        this.score += 100;
                        
                        // Level up every 1000 points
                        if (this.score % 1000 === 0) {
                            this.level++;
                            document.getElementById('level-value').textContent = this.level;
                        }
                    }
                    return;
                }
            });
            
            // Remove projectiles that are off screen
            if (projectile.isOffScreen(this.canvas.width, this.canvas.height)) {
                this.player.projectiles.splice(pIndex, 1);
            }
        });

        // Update score display
        document.getElementById('score-value').textContent = this.score;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines for visual reference
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Draw powerups
        this.powerups.forEach(powerup => powerup.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw player
        this.player.draw(this.ctx);

        // Draw projectiles
        this.player.projectiles.forEach(projectile => projectile.draw(this.ctx));
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameOver() {
        this.stop();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('menu').classList.remove('hidden');
        
        // Setup restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.onclick = () => {
            document.getElementById('menu').classList.add('hidden');
            this.reset();
            this.start();
        };
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.enemies = [];
        this.powerups = [];
        this.player.reset(this.canvas.width / 2, this.canvas.height / 2);
        document.getElementById('score-value').textContent = '0';
        document.getElementById('level-value').textContent = '1';
    }
}
