class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 0: speed, 1: damage, 2: multishot, 3: health
        this.radius = 10;
        this.duration = 5; // seconds
        
        // Animation
        this.angle = 0;
        this.rotationSpeed = Math.PI; // radians per second
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw power-up
        ctx.beginPath();
        
        switch(this.type) {
            case 0: // Speed (lightning bolt)
                ctx.fillStyle = '#ffff00';
                ctx.strokeStyle = '#ffa500';
                this.drawLightning(ctx);
                break;
            case 1: // Damage (sword)
                ctx.fillStyle = '#ff4444';
                ctx.strokeStyle = '#cc0000';
                this.drawSword(ctx);
                break;
            case 2: // Multishot (three dots)
                ctx.fillStyle = '#44ff44';
                ctx.strokeStyle = '#00cc00';
                this.drawMultishot(ctx);
                break;
            case 3: // Health (heart)
                ctx.fillStyle = '#ff4444';
                ctx.strokeStyle = '#cc0000';
                this.drawHeart(ctx);
                break;
        }
        
        ctx.restore();
        
        // Update rotation
        this.angle += this.rotationSpeed / 60; // Assuming 60 FPS
    }
    
    drawLightning(ctx) {
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(2, -2);
        ctx.lineTo(-2, 2);
        ctx.lineTo(5, 10);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    drawSword(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    drawMultishot(ctx) {
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(i * 6, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    drawHeart(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-5, 0, -10, 5, 0, 10);
        ctx.bezierCurveTo(10, 5, 5, 0, 0, 5);
        ctx.fill();
        ctx.stroke();
    }

    apply(player) {
        switch(this.type) {
            case 0: // Speed boost
                player.speed = 400;
                player.speedBoostTimer = this.duration;
                break;
            case 1: // Damage boost
                player.damage = 40;
                player.damageBoostTimer = this.duration;
                break;
            case 2: // Multishot
                player.multishot = 3;
                player.multishotTimer = this.duration;
                break;
            case 3: // Health
                player.heal(50);
                break;
        }
    }
}
