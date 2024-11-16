class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.collected = false;
        
        // Define power-up properties based on type
        switch(type) {
            case 'speed':
                this.color = '#00FF00';
                this.duration = 5000; // 5 seconds
                this.multiplier = 1.5;
                break;
            case 'damage':
                this.color = '#FF0000';
                this.duration = 8000; // 8 seconds
                this.multiplier = 2;
                break;
            case 'multishot':
                this.color = '#FFFF00';
                this.duration = 10000; // 10 seconds
                this.shots = 3;
                break;
            case 'health':
                this.color = '#FF69B4';
                this.healing = 50;
                break;
        }
    }

    collect(player) {
        if (this.collected) return;
        
        this.collected = true;
        switch(this.type) {
            case 'speed':
                const originalSpeed = player.speed;
                player.speed *= this.multiplier;
                setTimeout(() => {
                    player.speed = originalSpeed;
                }, this.duration);
                break;
            case 'damage':
                const originalDamage = player.weaponDamage;
                player.weaponDamage *= this.multiplier;
                setTimeout(() => {
                    player.weaponDamage = originalDamage;
                }, this.duration);
                break;
            case 'multishot':
                const originalShots = player.multishot;
                player.multishot = this.shots;
                setTimeout(() => {
                    player.multishot = originalShots;
                }, this.duration);
                break;
            case 'health':
                player.health = Math.min(100, player.health + this.healing);
                break;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw icon based on type
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch(this.type) {
            case 'speed': icon = '⚡'; break;
            case 'damage': icon = '⚔️'; break;
            case 'multishot': icon = '☄️'; break;
            case 'health': icon = '❤️'; break;
        }
        
        ctx.fillText(icon, this.x, this.y);
    }
}
