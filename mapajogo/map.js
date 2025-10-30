// map.js
class Platform {
    constructor(x, y, width = 200, height = 20, color = '#8B4513', type = 'normal') {
        this.position = { x, y };
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
    }
    
    draw() {
        const screenX = this.position.x + scrollOffset;
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, this.position.y, this.width, this.height);
        
        if (this.type === 'base') {
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX, this.position.y, this.width, 5);
        } else if (this.type === 'final') {
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(screenX, this.position.y, this.width, this.height);
            ctx.setLineDash([]);
        }
    }
}

class Projectile {
    constructor(x, y, vx = 12) {
        this.position = { x, y };
        this.velocity = { x: vx, y: 0 };
        this.radius = 6;
        this.color = 'black';
    }
    update() { this.position.x += this.velocity.x; }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}