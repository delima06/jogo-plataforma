class Player {
    constructor() {
        // Player sempre na mesma posição X (esquerda da tela)
        this.isShooting = false;
        this.shootTimer = 0;
        this.position = {
            x: 100, // Posição fixa na esquerda
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 1
        }
        this.width = 130;
        this.height = 150;
        this.facing = 1;
        this.image = new Image()
        this.isImageLoaded = false
        this.image.onload = () => {
            this.isImageLoaded = true
        }
        this.image.src = "assets/JogadorSprite_2.png"
        this.elapsedTime = 0
        this.currentFrame = 0
        this.sprites = {
            idle: {
                x: 460,
                y: 195,
                width: 130,
                height: 161,
                frames: 1
            },
            run: {
                x: 0,
                y: 20,
                width: 90,
                height: 180,
                frames: 6
            },
            jump: {
                x: 0,
                y: 0,
                width: 100,
                height: 170,
                frames: 6
            },
            shoot: {
                x: 0,
                y: 0,
                width: 130,
                height: 170,
                frames: 6
            }

        }
        this.currentSprite = this.sprites.idle
        this.currentCropWidth = this.sprites.idle.width;
        this.currentCropX = this.sprites.idle.x;
        this.framesDrawn = 0;

    }

        takeDamage() {
        if (isInvulnerable) return; // impede dano repetido
        playerLives--;
        isInvulnerable = true;
        invulnerabilityTimer = INVULNERABILITY_TIME;

        console.log(`💔 Player perdeu vida! Restam ${playerLives}`);

        if (playerLives <= 0) {
            gameOver();
        }
    }

    shoot() {
        this.isShooting = true;
        this.shootTimer = 0.25; // duração da animação (em segundos)
        this.currentSprite = (this.facing === 1) ? this.sprites.shootRight : this.sprites.shootLeft;
        this.currentFrame = 0;
    }
    switchSprites() {
        if (this.isOnGround && keys.right.pressed && this.currentSprite !== this.sprites.run) {
            //this.currentFrame = 0;
            this.maxFrames = this.sprites.run.frames
            this.currentSprite = this.sprites.run
            this.currentCropWidth = this.sprites.run.width;
            this.currentCropX = this.sprites.run.x;

        }
        else if (this.isOnGround && this.velocity.x === 0) {
            if (this.currentSprite !== this.sprites.idle) {
                //this.currentFrame = 0;
                this.maxFrames = this.sprites.idle.frames
                this.currentSprite = this.sprites.idle
                this.currentCropWidth = this.sprites.idle.width;
                this.currentCropX = this.sprites.idle.x;
            }
        }
    }
    draw() {

        if (this.isImageLoaded === true) {
            // ctx.fillStyle = 'rgba (255,0,0,0.1)';e
            // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
            ctx.drawImage(this.image, this.currentCropX + this.currentCropWidth * this.currentFrame, this.currentSprite.y, this.currentSprite.width, this.currentSprite.height, this.position.x, this.position.y, this.width, this.height);
        }
    }
    update(deltaTime) {
        this.isOnGround = isOnGround;
        if (this.currentSprite != this.sprites.idle) { this.currentFrame++ }
        else {
            this.currentFrame = 0;
        };

        if (this.isShooting) {
            this.shootTimer -= deltaTime;
            if (this.shootTimer <= 0) {
                this.isShooting = false;
                this.switchSprites(); // volta para idle/run automaticamente
            }
        }
        this.switchSprites();

        this.elapsedTime += deltaTime;
        const secondsInterval = .1
        if (this.elapsedTime > secondsInterval) {
            this.currentFrame = (this.currentFrame) % this.currentSprite.frames
            this.elapsedTime -= secondsInterval
        }

        this.draw();
        this.position.y += this.velocity.y;

        // Player não se move horizontalmente - posição X é fixa
        // Apenas movimento vertical (pulo e gravidade)

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravidade;
        } else {
            this.velocity.y = 0;
            isOnGround = true;
        }
    }
}