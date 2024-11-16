class Enemy {
    constructor(x, y, health = 100) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 100;
        this.health = health;
        this.maxHealth = health;
    }

    update(deltaTime, player) {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            this.x += moveX;
            this.y += moveY;
        }
    }

    draw(ctx) {
        // Draw enemy
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw health bar
        const barWidth = 30;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y + this.radius + 5;

        // Background
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }
}
