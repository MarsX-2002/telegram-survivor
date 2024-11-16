// Initialize Telegram Mini App
const tg = window.Telegram.WebApp;
tg.expand();

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize game objects
        this.player = new Player(this);
        this.enemies = [];
        this.weapons = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // Spawn enemy every second
        
        // Start game loop
        this.lastTime = 0;
        this.animate(0);

        // Setup touch controls
        this.setupControls();
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
    }

    spawnEnemy() {
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let x, y;
            
            switch(edge) {
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
            
            this.enemies.push(new Enemy(this, x, y));
            this.lastSpawnTime = currentTime;
        }
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score-value').textContent = this.score;
    }

    checkCollisions() {
        // Check weapon hits on enemies
        this.weapons.forEach((weapon, weaponIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.detectCollision(weapon, enemy)) {
                    enemy.takeDamage(weapon.damage);
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.updateScore(10);
                    }
                    this.weapons.splice(weaponIndex, 1);
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
        this.weapons = [];
        this.player = new Player(this);
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('score-value').textContent = '0';
        document.getElementById('level-value').textContent = '1';
    }

    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.gameOver) {
            // Clear canvas
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw game objects
            this.player.update(deltaTime);
            this.player.draw(this.ctx);

            this.spawnEnemy();
            
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime, this.player);
                enemy.draw(this.ctx);
            });

            this.weapons.forEach(weapon => {
                weapon.update(deltaTime);
                weapon.draw(this.ctx);
            });

            this.checkCollisions();

            // Clean up off-screen objects
            this.enemies = this.enemies.filter(enemy => 
                enemy.x > -50 && enemy.x < this.canvas.width + 50 &&
                enemy.y > -50 && enemy.y < this.canvas.height + 50
            );
            this.weapons = this.weapons.filter(weapon => 
                weapon.x > -50 && weapon.x < this.canvas.width + 50 &&
                weapon.y > -50 && weapon.y < this.canvas.height + 50
            );
        }

        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    document.getElementById('restart-button').addEventListener('click', () => game.restart());
});
