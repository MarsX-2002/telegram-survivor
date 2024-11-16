class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 2 + (game.level * 0.2); // Increase speed with level
        this.health = 50 + (game.level * 10); // Increase health with level
        this.maxHealth = this.health;
        this.dead = false;
        this.color = '#FF0000';
    }

    update() {
        if (this.dead) return;

        // Move towards player
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        // Draw enemy body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw health bar
        const healthBarWidth = 30;
        const healthBarHeight = 4;
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
            this.die();
        }
    }

    die() {
        this.dead = true;
        this.game.score += 10;
        if (this.game.score % 100 === 0) {
            this.game.level++;
        }
    }
}
