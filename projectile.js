class Projectile {
    constructor(game, x, y, velocity, damage) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.damage = damage;
        this.radius = 5;
        this.color = '#FF0';
        this.hit = false;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
