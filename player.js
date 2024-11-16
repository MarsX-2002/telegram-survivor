class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.radius = 20;
        this.speed = 200;
        this.health = 100;
        this.maxHealth = 100;
        this.projectiles = [];
        this.shootingInterval = 500; // ms
        this.lastShot = 0;
        this.damage = 20;
        this.multishot = 1;
        
        // Power-up timers
        this.speedBoostTimer = 0;
        this.damageBoostTimer = 0;
        this.multishotTimer = 0;
        
        console.log('Player created at', x, y);
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    update(deltaTime) {
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            this.x += moveX;
            this.y += moveY;
        }

        // Update power-up timers
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0) {
                this.speed = 200;
            }
        }
        
        if (this.damageBoostTimer > 0) {
            this.damageBoostTimer -= deltaTime;
            if (this.damageBoostTimer <= 0) {
                this.damage = 20;
            }
        }
        
        if (this.multishotTimer > 0) {
            this.multishotTimer -= deltaTime;
            if (this.multishotTimer <= 0) {
                this.multishot = 1;
            }
        }

        // Auto-shoot
        const now = performance.now();
        if (now - this.lastShot >= this.shootingInterval) {
            this.shoot();
            this.lastShot = now;
        }
    }

    shoot() {
        const angles = [];
        if (this.multishot === 1) {
            angles.push(0);
        } else if (this.multishot === 2) {
            angles.push(-15, 15);
        } else if (this.multishot === 3) {
            angles.push(-30, 0, 30);
        }

        angles.forEach(angle => {
            const radians = angle * (Math.PI / 180);
            const speed = 400;
            const vx = Math.cos(radians) * speed;
            const vy = Math.sin(radians) * speed;
            
            this.projectiles.push(new Projectile(
                this.x,
                this.y,
                vx,
                vy,
                this.damage
            ));
        });
    }

    draw(ctx) {
        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = '#45a049';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw health bar
        const barWidth = 40;
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
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    checkCollision(object) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + object.radius;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.health = this.maxHealth;
        this.speed = 200;
        this.damage = 20;
        this.multishot = 1;
        this.projectiles = [];
        this.speedBoostTimer = 0;
        this.damageBoostTimer = 0;
        this.multishotTimer = 0;
    }
}
