
class Enemy1 {
    constructor(leftLimit, rightLimit, xStart = null, width = 500, height = 500, color = "green", speed = 1.5, image = null) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.leftLimit = leftLimit;
        this.rightLimit = rightLimit - this.width;
        this.position = {
            x: xStart !== null ? Math.max(this.leftLimit, Math.min(xStart, this.rightLimit)) : this.leftLimit + 10,
            y: 0
        };
        this.velocity = { x: speed, y: 0 };
        this.type = 1;
        this.image = image;
    }

    update(platforms) {
        this.position.x += this.velocity.x;
        if (this.position.x <= this.leftLimit) {
            this.position.x = this.leftLimit;
            this.velocity.x *= -1;
        } else if (this.position.x >= this.rightLimit) {
            this.position.x = this.rightLimit;
            this.velocity.x *= -1;
        }
    }

    draw(ctx, scrollOffset) {
    // Tenta desenhar a imagem
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        ctx.drawImage(
            this.image, 
            this.position.x + scrollOffset, 
            this.position.y, 
            this.width, 
            this.height
        );
    } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x + scrollOffset, this.position.y, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.fillText('img?', this.position.x + scrollOffset + 5, this.position.y + 15);
    }
}

    collidesWithPlayer(player, scrollOffset) {
        const sx = this.position.x + scrollOffset;
        return !(player.position.x > sx + this.width ||
                 player.position.x + player.width < sx ||
                 player.position.y > this.position.y + this.height ||
                 player.position.y + player.height < this.position.y);
    }
}

class Enemy2 {
    constructor(xPosition, yMin = 400, yMax = 600, width = 500, height = 500, color = "purple", speed = 1.5, image = null) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.yMin = yMin;
        this.yMax = yMax - this.height;
        this.position = {
            x: xPosition,
            y: yMin + (Math.random() * (yMax - yMin))
        };
        this.velocity = { x: 0, y: speed * (Math.random() > 0.5 ? 1 : -1) };
        this.type = 2;
        this.image = image;
    }

    update(platforms) {
        this.position.y += this.velocity.y;
        if (this.position.y <= this.yMin) {
            this.position.y = this.yMin;
            this.velocity.y *= -1;
        } else if (this.position.y >= this.yMax) {
            this.position.y = this.yMax;
            this.velocity.y *= -1;
        }
    }

    draw(ctx, scrollOffset) {
    // Tenta desenhar a imagem
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        ctx.drawImage(
            this.image, 
            this.position.x + scrollOffset, 
            this.position.y, 
            this.width, 
            this.height
        );
    } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x + scrollOffset, this.position.y, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.fillText('img?', this.position.x + scrollOffset + 5, this.position.y + 15);
    }
}

    collidesWithPlayer(player, scrollOffset) {
        const sx = this.position.x + scrollOffset;
        return !(player.position.x > sx + this.width ||
                 player.position.x + player.width < sx ||
                 player.position.y > this.position.y + this.height ||
                 player.position.y + player.height < this.position.y);
    }
}

class Enemy3 {
    constructor(startPlatform, direction = 1, width = 35, height = 35, color = "blue", jumpIntervalFrames = 120, jumpStrength = -10, jumpSpeed = 4, gravity = 0.5, image = null) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.position = {
            x: startPlatform.position.x + 10,
            y: startPlatform.position.y - this.height
        };
        this.velocity = { x: 0, y: 0 };
        this.direction = direction;
        this.jumpInterval = jumpIntervalFrames;
        this.jumpTimer = this.jumpInterval;
        this.jumpStrength = jumpStrength;
        this.jumpSpeed = jumpSpeed;
        this.gravity = gravity;
        this.isOnGround = true;
        this.type = 3;
        this.image = image;
    }

    update(platforms) {
        if (this.isOnGround) {
            this.jumpTimer--;
            if (this.jumpTimer <= 0) {
                this.isOnGround = false;
                this.velocity.y = this.jumpStrength;
                this.velocity.x = this.jumpSpeed * this.direction;
                this.jumpTimer = this.jumpInterval;
            }
        }

        if (!this.isOnGround) {
            this.velocity.y += this.gravity;
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
            
            for (const platform of platforms) {
                if (this.position.y + this.height <= platform.position.y &&
                    this.position.y + this.height + this.velocity.y >= platform.position.y &&
                    this.position.x + this.width >= platform.position.x &&
                    this.position.x <= platform.position.x + platform.width &&
                    this.velocity.y > 0) {
                    this.position.y = platform.position.y - this.height;
                    this.velocity.y = 0;
                    this.velocity.x = 0;
                    this.isOnGround = true;
                    break;
                }
            }
        }
    }

    draw(ctx, scrollOffset) {
    // Tenta desenhar a imagem
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        ctx.drawImage(
            this.image, 
            this.position.x + scrollOffset, 
            this.position.y, 
            this.width, 
            this.height
        );
    } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x + scrollOffset, this.position.y, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.fillText('img?', this.position.x + scrollOffset + 5, this.position.y + 15);
    }
}

    collidesWithPlayer(player, scrollOffset) {
        const sx = this.position.x + scrollOffset;
        return !(player.position.x > sx + this.width ||
                 player.position.x + player.width < sx ||
                 player.position.y > this.position.y + this.height ||
                 player.position.y + player.height < this.position.y);
    }
}