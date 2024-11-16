class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 2;
        this.color = '#FF4444';
        this.health = 100;
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    update(deltaTime, player) {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const velocityX = (dx / distance) * this.speed;
            const velocityY = (dy / distance) * this.speed;
            
            this.x += velocityX;
            this.y += velocityY;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw health bar
        const healthBarWidth = 30;
        const healthBarHeight = 4;
        const healthPercentage = this.health / 100;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - healthBarWidth/2, this.y - this.radius - 10, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x - healthBarWidth/2, this.y - this.radius - 10, healthBarWidth * healthPercentage, healthBarHeight);
    }
}
