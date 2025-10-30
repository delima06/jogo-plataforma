const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração do canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variáveis do mapa
let scrollOffset = 0;
let currentPhase = 1;
let isOnGround = true;
const gravidade = 1;

// VELOCIDADE DO MAPA 2x MAIS RÁPIDO
const MAP_SPEED_MULTIPLIER = 2.0;

// Configuração das fases REDUZIDAS - APENAS 3 FASES
const phaseConfig = {
    1: { bg: 'bg1', startX: 0, endX: 2000, name: "Ponte velha", color: '#8B4513' },
    2: { bg: 'bg2', startX: 2000, endX: 4000, name: "Morro do careca", color: '#A0522D' },
    4: { bg: 'bg4', startX: 4000, endX: 6000, name: "Newton Navarro", color: '#CD853F' }
};

const TOTAL_MAP_WIDTH = 6000; // MAPA REDUZIDO

// Variável para controlar se o jogo foi finalizado
let gameCompleted = false;

// Carregar imagem de vitória
const victoryImage = new Image();
victoryImage.src = 'assets/final.jpg';
let victoryImageLoaded = false;

victoryImage.onload = function () {
    victoryImageLoaded = true;
    console.log('🎉 Imagem de vitória carregada com sucesso!');
};

victoryImage.onerror = function () {
    console.log('❌ Erro ao carregar imagem de vitória. Usando fallback.');
    victoryImageLoaded = false;
};

// PLAYER TRAVADO NA ESQUERDA
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
        this.image.src = "images/JogadorSprite_2.png"
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


// Classe Platform 
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
            ctx.strokeStyle = '#3D2812';
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, this.position.y, this.width, this.height);
        } else if (this.type === 'final') {
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(screenX, this.position.y, this.width, this.height);
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = '#3D2812';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, this.position.y, this.width, this.height);
        }
    }
}

// Array de plataformas REDUZIDO - APENAS 2 PLATAFORMAS POR FASE
const platforms = [
    // === FASE 1 - FLORESTA (0-2000) ===
    // 1. Plataforma gigante em Y = 740
    new Platform(-1, 740, 2000, 40, 'red', 'base'),
    // 2. Plataforma no meio da fase
    new Platform(600, 500, 800, 20, 'brown'),

    // === FASE 2 - CAVERNA (2000-4000) ===
    // 1. Plataforma gigante em Y = 740
    new Platform(1999, 740, 2000, 40, 'red', 'base'),
    // 2. Plataforma no meio da fase
    new Platform(2400, 500, 800, 20, 'brown'),

    // === FASE 4 - CASTELO (4000-6000) ===
    // 1. Plataforma gigante em Y = 740
    new Platform(3999, 740, 2001, 40, 'red', 'final'),
    // 2. Plataforma no meio da fase
    new Platform(4400, 500, 800, 20, 'brown')
];

// Sistema de projéteis
let projectiles = [];
let lastShotTime = 0;
const shotCooldown = 100;


class Projectile {
    constructor(x, y, vx = 12) {
        this.position = { x, y };
        this.velocity = { x: vx, y: 0 };
        this.radius = 6;
        this.color = 'red';
    }
    update() {
        this.position.x += this.velocity.x;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function shootHorizontal(dir = 1) {
    const now = Date.now();
    if (now - lastShotTime < shotCooldown) return;
    lastShotTime = now;

    // Dispara o projétil
    const startX = player.position.x + player.width / 2 + dir * (player.width / 2 + 6);
    const startY = player.position.y + player.height / 2;
    const speed = 12 * dir;
    projectiles.push(new Projectile(startX, startY, speed));

    // Troca o sprite do player para o de tiro
    player.shoot();
}
class Enemy {
    constructor(x, y, width = 40, height = 40, color = 'green', vx = -2) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = { x: vx, y: 0 };
    }

    update() {
        this.position.x += this.velocity.x; // movimento simples
    }

    draw() {
        const screenX = this.position.x + scrollOffset;
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, this.position.y, this.width, this.height);
    }

    // Verifica colisão com player
    collidesWithPlayer(player) {
        const screenX = this.position.x + scrollOffset;
        return (
            player.position.x < screenX + this.width &&
            player.position.x + player.width > screenX &&
            player.position.y < this.position.y + this.height &&
            player.position.y + player.height > this.position.y
        );
    }

    // Verifica colisão com projétil
    collidesWithProjectile(projectile) {
        const screenX = this.position.x + scrollOffset;
        return (
            projectile.position.x + projectile.radius > screenX &&
            projectile.position.x - projectile.radius < screenX + this.width &&
            projectile.position.y + projectile.radius > this.position.y &&
            projectile.position.y - projectile.radius < this.position.y + this.height
        );
    }
}

// ========================
// LISTA DE INIMIGOS
// ========================
let enemies = [
    // Fase 1
    new Enemy(1000, 700, 40, 40, 'green', -1),
    // Fase 2
    new Enemy(2600, 700, 40, 40, 'purple', -1),
    // Fase 4
    new Enemy(4800, 700, 40, 40, 'darkred', -1)
];
// Controles
const keys = {
    right: { pressed: false },
    left: { pressed: false }
};

// Instanciar player
const player = new Player();

// SISTEMA DE CÂMERA - PLAYER TRAVADO NA ESQUERDA, MAPA SE MOVE PARA DIREITA
function updateCamera() {
    // MOVIMENTO DO MAPA - sempre se move para a direita quando player se move
    if (keys.right.pressed) {
        // Mapa se move para ESQUERDA (mostrando mais à direita)
        scrollOffset -= 5 * MAP_SPEED_MULTIPLIER;
    }
    if (keys.left.pressed) {
        // Mapa se move para DIREITA (mostrando mais à esquerda)
        scrollOffset += 5 * MAP_SPEED_MULTIPLIER;
    }

    // SEM LIMITE DO MAPA - player pode navegar livremente
    // Player sempre na mesma posição X (travado na esquerda)
    player.position.x = 100; // Posição fixa

    // SEM BARREIRA VERTICAL - player pode sair da tela livremente
}

// Sistema de mudança de fase
function updatePhase() {
    const playerWorldX = player.position.x - scrollOffset;
    let newPhase = currentPhase;

    if (playerWorldX >= phaseConfig[2].startX && playerWorldX < phaseConfig[2].endX) {
        newPhase = 2;
    } else if (playerWorldX >= phaseConfig[4].startX && playerWorldX < phaseConfig[4].endX) {
        newPhase = 4;
    } else if (playerWorldX < phaseConfig[2].startX) {
        newPhase = 1;
    }

    if (newPhase !== currentPhase) {
        changePhase(newPhase);
    }
}

function changePhase(phaseNumber) {
    document.querySelectorAll('.background').forEach(bg => {
        bg.classList.remove('active');
    });

    const currentBg = document.getElementById(phaseConfig[phaseNumber].bg);
    if (currentBg) {
        currentBg.classList.add('active');
    }

    showPhaseName(phaseConfig[phaseNumber].name);
    currentPhase = phaseNumber;
}

function showPhaseName(phaseName) {
    const phaseNameElement = document.getElementById('phaseName');
    if (phaseNameElement) {
        phaseNameElement.textContent = phaseName;
        phaseNameElement.classList.add('show');
        setTimeout(() => phaseNameElement.classList.remove('show'), 3000);
    }
}

// SISTEMA DE COLISÃO - Player travado, apenas colisão vertical
function checkPlatformCollisions() {
    let onPlatform = false;

    platforms.forEach(platform => {
        const platformScreenX = platform.position.x + scrollOffset;

        // Colisão de cima para baixo (pousar na plataforma)
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platformScreenX &&
            player.position.x <= platformScreenX + platform.width) {

            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
            onPlatform = true;
        }

        // Colisão de baixo para cima (cabeça na plataforma)
        if (player.position.y >= platform.position.y + platform.height &&
            player.position.y + player.velocity.y <= platform.position.y + platform.height &&
            player.position.x + player.width >= platformScreenX &&
            player.position.x <= platformScreenX + platform.width &&
            player.velocity.y < 0) {

            player.velocity.y = 0;
        }
    });

    isOnGround = onPlatform;
}

// WALLPAPER DE VITÓRIA COM IMAGEM
function drawVictoryWallpaper() {
    // Se a imagem foi carregada, desenha ela
    if (victoryImageLoaded) {
        // Calcula as dimensões para preencher a tela mantendo a proporção
        const imgRatio = victoryImage.width / victoryImage.height;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            // Imagem mais larga que o canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // Imagem mais alta que o canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.drawImage(victoryImage, offsetX, offsetY, drawWidth, drawHeight);

        // Adiciona uma sobreposição escura para melhorar a legibilidade do texto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    } else {
        // Fallback se a imagem não carregar
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Texto sobre a imagem
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 PARABÉNS! 🎉', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('VOCÊ CHEGOU AO FINAL!', canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Pressione F5 para jogar novamente', canvas.width / 2, canvas.height - 50);
}

// EVENT LISTENERS - Apenas movimento vertical do player
addEventListener('keydown', ({ keyCode }) => {
    if (gameCompleted) return; // Bloqueia controles quando o jogo termina

    switch (keyCode) {
        case 65: // A - left (move mapa para direita)
            keys.left.pressed = true;
            player.facing = -1;
            break;
        case 68: // D - right (move mapa para esquerda)
            keys.right.pressed = true;
            player.facing = 1;
            break;
        case 87: // W - up (pulo - único movimento do player)
            if (isOnGround) {
                player.velocity.y = -25;
                isOnGround = false;
            }
            break;
    }
});

addEventListener('keyup', ({ keyCode }) => {
    if (gameCompleted) return; // Bloqueia controles quando o jogo termina

    switch (keyCode) {
        case 65: // A - left
            keys.left.pressed = false;
            break;
        case 68: // D - right
            keys.right.pressed = false;
            break;
    }
});

// Tiro com espaço
window.addEventListener('keydown', (e) => {
    if (gameCompleted) return; // Bloqueia tiros quando o jogo termina

    if (e.code === 'Space' || e.keyCode === 32) {
        e.preventDefault();
        shootHorizontal(player.facing || 1);
    }
});

// Scroll com mouse
canvas.addEventListener('wheel', (e) => {
    if (gameCompleted) return; // Bloqueia scroll quando o jogo termina
    scrollOffset += e.deltaY * 0.5 * MAP_SPEED_MULTIPLIER;
});

// Loop principal
let lastTime = performance.now()
function animate() {
    //console.log(player.framesDrawn)
    const currentTime = performance.now()
    const deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime
    requestAnimationFrame(animate);
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.framesDrawn++;
    if (player.framesDrawn >= 10) {
        player.framesDrawn = 0;
    }
    // Se o jogo foi completado, mostra apenas o wallpaper de vitória
    if (gameCompleted) {
        drawVictoryWallpaper();
        return;
    }

    // Atualizar câmera (player travado, mapa se move)
    updateCamera();

    // Desenhar plataformas
    platforms.forEach(platform => {
        platform.draw();
    });

    // Verificar colisões
    checkPlatformCollisions();

    // Atualizar player (apenas movimento vertical)


    // Atualizar projéteis
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();

        p.draw();
        if (p.position.x < -50 || p.position.x > canvas.width + 50) {
            projectiles.splice(i, 1);
        }
    }
    enemies.forEach(enemy => enemy.update());
    enemies.forEach(enemy => {
        if (enemy.collidesWithPlayer(player)) {
            console.log('💀 Player atingido por inimigo!');
            // Reinicia posição ou lógica de dano
            player.position.y = 100;
            scrollOffset = 0;
        }
    });

    // ========================
    // COLISÕES PROJÉTIL ↔ INIMIGO
    // ========================
    projectiles.forEach((proj, pIndex) => {
        // Remover projétil se sair da tela
        if (proj.position.x > canvas.width || proj.position.x < 0) {
            projectiles.splice(pIndex, 1);
            return;
        }

        enemies.forEach((enemy, eIndex) => {
            if (enemy.collidesWithProjectile(proj)) {
                console.log('🔥 Inimigo destruído!');
                enemies.splice(eIndex, 1); // remove inimigo
                projectiles.splice(pIndex, 1); // remove projétil
            }
        });
    }); enemies.forEach(enemy => enemy.draw());

    // Atualizar fase
    updatePhase();

    // Verificar se chegou ao final
    const playerWorldX = player.position.x - scrollOffset;
    if (currentPhase === 4 && playerWorldX >= 6000 - 50 && !gameCompleted) {
        gameCompleted = true;
    }
    player.update(deltaTime);
    //ctx.restore()

}

// Iniciar
window.addEventListener('load', () => {
    player.position.x = 100; // Posição fixa na esquerda
    animate();
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Manter player na posição fixa após resize
    player.position.x = 100;
});