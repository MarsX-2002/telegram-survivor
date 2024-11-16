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
        this.shootingAngle = 0;
        
        // Movement flags
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Power-up timers
        this.speedBoostTimer = 0;
        this.damageBoostTimer = 0;
        this.multishotTimer = 0;
        
        console.log('Player created at', x, y);
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        // Update shooting angle based on mouse/touch position
        const dx = x - this.x;
        const dy = y - this.y;
        this.shootingAngle = Math.atan2(dy, dx);
    }

    handleKeyDown(key) {
        switch(key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.moveUp = true;
                break;
            case 's':
            case 'arrowdown':
                this.moveDown = true;
                break;
            case 'a':
            case 'arrowleft':
                this.moveLeft = true;
                break;
            case 'd':
            case 'arrowright':
                this.moveRight = true;
                break;
        }
    }

    handleKeyUp(key) {
        switch(key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.moveUp = false;
                break;
            case 's':
            case 'arrowdown':
                this.moveDown = false;
                break;
            case 'a':
            case 'arrowleft':
                this.moveLeft = false;
                break;
            case 'd':
            case 'arrowright':
                this.moveRight = false;
                break;
        }
    }

    update(deltaTime) {
        // Handle keyboard movement
        const moveSpeed = this.speed * deltaTime;
        if (this.moveUp) this.y -= moveSpeed;
        if (this.moveDown) this.y += moveSpeed;
        if (this.moveLeft) this.x -= moveSpeed;
        if (this.moveRight) this.x += moveSpeed;

        // Update shooting angle based on movement direction when using keyboard
        if (this.moveUp || this.moveDown || this.moveLeft || this.moveRight) {
            let angle = 0;
            if (this.moveUp) angle = -Math.PI/2;
            if (this.moveDown) angle = Math.PI/2;
            if (this.moveLeft) angle = Math.PI;
            if (this.moveRight) angle = 0;
            
            // Diagonal movement
            if (this.moveUp && this.moveRight) angle = -Math.PI/4;
            if (this.moveUp && this.moveLeft) angle = -3*Math.PI/4;
            if (this.moveDown && this.moveRight) angle = Math.PI/4;
            if (this.moveDown && this.moveLeft) angle = 3*Math.PI/4;
            
            this.shootingAngle = angle;
        }

        // Keep player within canvas bounds
        const game = window.game;
        if (game) {
            this.x = Math.max(this.radius, Math.min(game.canvas.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(game.canvas.height - this.radius, this.y));
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
        const baseAngle = this.shootingAngle;
        
        if (this.multishot === 1) {
            angles.push(baseAngle);
        } else if (this.multishot === 2) {
            angles.push(baseAngle - Math.PI/12, baseAngle + Math.PI/12);
        } else if (this.multishot === 3) {
            angles.push(baseAngle - Math.PI/6, baseAngle, baseAngle + Math.PI/6);
        }

        angles.forEach(angle => {
            const speed = 400;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
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
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#008000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw health bar
        const healthBarWidth = this.radius * 2;
        const healthBarHeight = 5;
        const healthBarY = this.y - this.radius - 10;
        
        // Background
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - healthBarWidth/2, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            healthBarY,
            healthBarWidth * (this.health / this.maxHealth),
            healthBarHeight
        );
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
