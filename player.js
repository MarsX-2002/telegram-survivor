class Player {
    constructor(game) {
        this.game = game;
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.radius = 20;
        this.speed = 5;
        this.color = '#4CAF50';
        this.weapons = [];
        this.lastShot = 0;
        this.shotCooldown = 500; // milliseconds
    }

    move(deltaX, deltaY) {
        // Normalize movement
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (length > 0) {
            const normalizedX = (deltaX / length) * this.speed;
            const normalizedY = (deltaY / length) * this.speed;
            
            // Update position with bounds checking
            this.x = Math.max(this.radius, Math.min(this.game.canvas.width - this.radius, this.x + normalizedX));
            this.y = Math.max(this.radius, Math.min(this.game.canvas.height - this.radius, this.y + normalizedY));
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShot > this.shotCooldown) {
            // Find nearest enemy
            let nearestEnemy = null;
            let minDistance = Infinity;
            
            this.game.enemies.forEach(enemy => {
                const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                const angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
                const weapon = new Weapon(this.game, this.x, this.y, angle);
                this.game.weapons.push(weapon);
                this.lastShot = currentTime;
            }
        }
    }

    update(deltaTime) {
        this.shoot();
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
