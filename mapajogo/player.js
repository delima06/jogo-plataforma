// player.js
class Player {
    constructor() {
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 1 };
        this.width = 30;
        this.height = 30;
        this.facing = 1;
    }
    
    draw() {
        if (typeof isInvulnerable !== 'undefined' && isInvulnerable && Math.floor(invulnerabilityTimer / 10) % 2 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        } else {
            ctx.fillStyle = 'blue';
        }
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    
    update() {
        this.draw();
        this.position.y += this.velocity.y;
        
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravidade;
        } else {
            this.velocity.y = 0;
            isOnGround = true;
        }
    }
    
    takeDamage() {
        if (!isInvulnerable) {
            playerLives--;
            isInvulnerable = true;
            invulnerabilityTimer = INVULNERABILITY_TIME;
            console.log(`Vidas restantes: ${playerLives}`);
            
            if (playerLives <= 0) {
                gameOver();
            }
        }
    }
}