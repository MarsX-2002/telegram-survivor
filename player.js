class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 5;
        this.color = '#4A90E2';
        this.velocity = { x: 0, y: 0 };
        this.health = 100;
        this.maxHealth = 100;
        this.weaponDamage = 25;
        this.multishot = 1;
        this.lastShot = 0;
        this.shootingInterval = 500; // milliseconds
    }

    move(dx, dy) {
        this.velocity.x = dx * this.speed;
        this.velocity.y = dy * this.speed;
    }

    update() {
        // Update position based on velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Keep player within canvas bounds
        this.x = Math.max(this.radius, Math.min(this.game.canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(this.game.canvas.height - this.radius, this.y));

        // Auto-shooting logic
        const now = Date.now();
        if (now - this.lastShot >= this.shootingInterval) {
            this.shoot();
            this.lastShot = now;
        }
    }

    shoot() {
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;

        // Calculate angle to nearest enemy
        const angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);

        // Create multiple projectiles if multishot is active
        const spreadAngle = Math.PI / 8; // 22.5 degrees
        for (let i = 0; i < this.multishot; i++) {
            let shotAngle = angle;
            if (this.multishot > 1) {
                shotAngle += spreadAngle * (i - (this.multishot - 1) / 2);
            }
            
            const velocity = {
                x: Math.cos(shotAngle) * 10,
                y: Math.sin(shotAngle) * 10
            };
            
            this.game.projectiles.push(new Projectile(
                this.game,
                this.x,
                this.y,
                velocity,
                this.weaponDamage
            ));
        }
    }

    findNearestEnemy() {
        let nearest = null;
        let minDistance = Infinity;

        for (const enemy of this.game.enemies) {
            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }

        return nearest;
    }

    draw(ctx) {
        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw health bar
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        const healthBarY = this.y + this.radius + 5;
        
        // Background (empty health)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - healthBarWidth/2, healthBarY, healthBarWidth, healthBarHeight);
        
        // Foreground (current health)
        ctx.fillStyle = '#00FF00';
        const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
        ctx.fillRect(this.x - healthBarWidth/2, healthBarY, currentHealthWidth, healthBarHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.game.gameOver();
        }
    }
}
