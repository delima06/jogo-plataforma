// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const enemyImages = {
    type1: new Image(),
    type2: new Image(),
    type3: new Image()
};

// ADICIONE ESTES LISTENERS PARA DEBUG
enemyImages.type1.onload = () => console.log('✅ enemyImages.type1 carregada');
enemyImages.type2.onload = () => console.log('✅ enemyImages.type2 carregada');
enemyImages.type3.onload = () => console.log('✅ enemyImages.type3 carregada');

enemyImages.type1.onerror = () => console.error('❌ Erro ao carregar type1');
enemyImages.type2.onerror = () => console.error('❌ Erro ao carregar type2');
enemyImages.type3.onerror = () => console.error('❌ Erro ao carregar type3');

enemyImages.type1.src = 'assets/1zumbitest.png';
enemyImages.type2.src = 'assets/2zumbitest.png';
enemyImages.type3.src = 'assets/3zumbitest.png';

// Variáveis globais
let scrollOffset = 0;
let currentPhase = 1;
let isOnGround = true;
const gravidade = 1;
const MAP_SPEED_MULTIPLIER = 2.0;

// Sistema de vida do player
let playerLives = 3;
let isInvulnerable = false;
let invulnerabilityTimer = 0;
const INVULNERABILITY_TIME = 60;

// Estados do jogo
let gameCompleted = false;
let gameOverState = false;

// Configuração das fases
const phaseConfig = {
    1: { bg: 'bg1', startX: 0, endX: 2000, name: "Ponte velha", color: '#8B4513' },
    2: { bg: 'bg2', startX: 2000, endX: 4000, name: "Morro do careca", color: '#A0522D' },
    4: { bg: 'bg4', startX: 4000, endX: 6000, name: "Newton Navarro", color: '#CD853F' }
};

// Carregar imagens
const victoryImage = new Image();
victoryImage.src = 'assets/vitoria.png';
let victoryImageLoaded = false;

const gameOverImage = new Image();
gameOverImage.src = 'assets/morte.png';
let gameOverImageLoaded = false;

victoryImage.onload = function() {
    victoryImageLoaded = true;
    console.log('🎉 Imagem de vitória carregada com sucesso!');
};

gameOverImage.onload = function() {
    gameOverImageLoaded = true;
    console.log('💀 Imagem de game over carregada com sucesso!');
};

// Array de plataformas
const platforms = [
    new Platform(-1, 740, 2000, 40, 'red', 'base'),
    new Platform(600, 500, 800, 20, 'brown'),
    new Platform(1999, 740, 2000, 40, 'red', 'base'),
    new Platform(2400, 500, 800, 20, 'brown'),
    new Platform(3999, 740, 2001, 40, 'red', 'final'),
    new Platform(4400, 500, 800, 20, 'brown')
];

// Sistema de projéteis
let projectiles = [];
let lastShotTime = 0;
const shotCooldown = 100;

// Array de inimigos
let enemies = [];

// Controles
const keys = { right: { pressed: false }, left: { pressed: false } };
const player = new Player();

// Funções do jogo
function shootHorizontal(dir = 1) {
    const now = Date.now();
    if (now - lastShotTime < shotCooldown) return;
    lastShotTime = now;

    const startX = player.position.x + player.width / 2 + dir * (player.width / 2 + 6);
    const startY = player.position.y + player.height / 2;
    const speed = 12 * dir;
    projectiles.push(new Projectile(startX, startY, speed));
}

function initializeEnemies() {
    enemies = [];
    
    // FASE 1 - 4 inimigos
    const p1 = platforms[0], p2 = platforms[1];
    enemies.push(new Enemy1(p1.position.x + 100, p1.position.x + p1.width - 100, p1.position.x + 200, 150, 150, "green", 1.5, enemyImages.type1));
    enemies.push(new Enemy1(p2.position.x + 50, p2.position.x + p2.width - 50, p2.position.x + 100, 150, 150, "darkgreen", 2.0, enemyImages.type1));
    enemies.push(new Enemy2(p1.position.x + 500, 400, 600, 100, 100, "purple", 2.0, enemyImages.type2));
    enemies.push(new Enemy2(p1.position.x + 800, 450, 550, 100, 100, "pink", 2.5, enemyImages.type2));
    
    // FASE 2 - 5 inimigos
    const p3 = platforms[2], p4 = platforms[3];
    enemies.push(new Enemy1(p3.position.x + 150, p3.position.x + p3.width - 150, p3.position.x + 300, 150, 150, "orange", 1.8, enemyImages.type1));
    enemies.push(new Enemy2(p3.position.x + 800, 350, 550, 150, 150, "magenta", 2.2, enemyImages.type2));
    enemies.push(new Enemy3(p4, 1, 150, 150, "blue", 90, -12, 5, 0.5, enemyImages.type3));
    enemies.push(new Enemy3(p4, -1, 150, 150, "cyan", 100, -11, 4, 0.5, enemyImages.type3));
    enemies.push(new Enemy2(p3.position.x + 1200, 300, 500, 30, 30, "red", 2.0, enemyImages.type2));
    
    // FASE 4 - 6 inimigos
    const p5 = platforms[4], p6 = platforms[5];
    enemies.push(new Enemy1(p5.position.x + 200, p5.position.x + p5.width - 200, p5.position.x + 400, 150, 150, "red", 2.2, enemyImages.type1));
    enemies.push(new Enemy2(p5.position.x + 1000, 300, 500, 150, 150, "darkred", 2.5, enemyImages.type2));
    enemies.push(new Enemy3(p6, -1, 150, 150, "darkblue", 80, -14, 6, 0.5, enemyImages.type3));
    enemies.push(new Enemy3(p6, 1, 150, 150, "cyan", 70, -13, 5.5, 0.5, enemyImages.type3));
    enemies.push(new Enemy1(p5.position.x + 600, p5.position.x + p5.width - 600, p5.position.x + 800, 150, 150, "maroon", 2.0, enemyImages.type1));
    enemies.push(new Enemy2(p5.position.x + 1400, 250, 450, 150, 150, "orange", 2.8, enemyImages.type2));

    positionEnemiesOnPlatforms();
}

function positionEnemiesOnPlatforms() {
    enemies.forEach(enemy => {
        if (enemy.type === 1 || enemy.type === 3) {
            let foundPlatform = false;
            for (const platform of platforms) {
                if (enemy.position.x >= platform.position.x && 
                    enemy.position.x <= platform.position.x + platform.width) {
                    enemy.position.y = platform.position.y - enemy.height;
                    foundPlatform = true;
                    break;
                }
            }
            if (!foundPlatform) enemy.position.y = canvas.height - enemy.height - 40;
        }
    });
}

function updateCamera() {
    if (keys.right.pressed) scrollOffset -= 5 * MAP_SPEED_MULTIPLIER;
    if (keys.left.pressed) scrollOffset += 5 * MAP_SPEED_MULTIPLIER;
    player.position.x = 100;
}

function updatePhase() {
    const playerWorldX = player.position.x - scrollOffset;
    let newPhase = currentPhase;
    
    if (playerWorldX >= phaseConfig[2].startX && playerWorldX < phaseConfig[2].endX) newPhase = 2;
    else if (playerWorldX >= phaseConfig[4].startX && playerWorldX < phaseConfig[4].endX) newPhase = 4;
    else if (playerWorldX < phaseConfig[2].startX) newPhase = 1;
    
    if (newPhase !== currentPhase) changePhase(newPhase);
}

function changePhase(phaseNumber) {
    document.querySelectorAll('.background').forEach(bg => bg.classList.remove('active'));
    const currentBg = document.getElementById(phaseConfig[phaseNumber].bg);
    if (currentBg) currentBg.classList.add('active');
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

function checkPlatformCollisions() {
    let onPlatform = false;
    platforms.forEach(platform => {
        const screenX = platform.position.x + scrollOffset;
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= screenX &&
            player.position.x <= screenX + platform.width) {
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
            onPlatform = true;
        }
    });
    isOnGround = onPlatform;
}

function checkEnemyCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.collidesWithPlayer(player, scrollOffset)) {
            player.takeDamage();
            enemies.splice(i, 1);
            continue;
        }
        
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            const sx = enemy.position.x + scrollOffset;
            if (projectile.position.x + projectile.radius > sx &&
                projectile.position.x - projectile.radius < sx + enemy.width &&
                projectile.position.y + projectile.radius > enemy.position.y &&
                projectile.position.y - projectile.radius < enemy.position.y + enemy.height) {
                projectiles.splice(j, 1);
                enemies.splice(i, 1);
                break;
            }
        }
    }
}

function drawHUD() {
    // Desenhar vidas
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Vidas: ${playerLives}`, 20, 30);
    
    // Desenhar corações
    for (let i = 0; i < 3; i++) {
        if (i < playerLives) {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'gray';
        }
        ctx.fillRect(120 + i * 25, 15, 20, 20);
    }
}

function gameOver() {
    gameOverState = true;
    console.log("Game Over!");
}

function drawFullscreenImage(image, imageLoaded) {
    if (imageLoaded) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawVictoryScreen() {
    drawFullscreenImage(victoryImage, victoryImageLoaded);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Pressione F5 para jogar novamente', canvas.width / 2, canvas.height - 50);
}

function drawGameOverScreen() {
    drawFullscreenImage(gameOverImage, gameOverImageLoaded);
    
    
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '20px Arial';
    ctx.fillText('Pressione F5 para tentar novamente', canvas.width / 2, canvas.height - 50);
}

// Event listeners
addEventListener('keydown', ({ keyCode }) => {
    if (gameCompleted || gameOverState) return;
    switch (keyCode) {
        case 65: keys.left.pressed = true; player.facing = -1; break;
        case 68: keys.right.pressed = true; player.facing = 1; break;
        case 87: if (isOnGround) { player.velocity.y = -25; isOnGround = false; } break;
    }
});

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: keys.left.pressed = false; break;
        case 68: keys.right.pressed = false; break;
    }
});

window.addEventListener('keydown', (e) => {
    if (gameCompleted || gameOverState) return;
    if (e.code === 'Space' || e.keyCode === 32) {
        e.preventDefault();
        shootHorizontal(player.facing || 1);
    }
});

canvas.addEventListener('wheel', (e) => {
    if (gameCompleted || gameOverState) return;
    scrollOffset += e.deltaY * 0.5 * MAP_SPEED_MULTIPLIER;
});

// Loop principal
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameCompleted) {
        drawVictoryScreen();
        return;
    }
    
    if (gameOverState) {
        drawGameOverScreen();
        return;
    }
    
    // Atualizar invulnerabilidade
    if (isInvulnerable) {
        invulnerabilityTimer--;
        if (invulnerabilityTimer <= 0) {
            isInvulnerable = false;
        }
    }
    
    updateCamera();
    platforms.forEach(platform => platform.draw());
    enemies.forEach(enemy => {
        enemy.update(platforms);
        enemy.draw(ctx, scrollOffset);
    });
    
    checkPlatformCollisions();
    checkEnemyCollisions();
    player.update();
    
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();
        p.draw();
        if (p.position.x < -50 || p.position.x > canvas.width + 50) {
            projectiles.splice(i, 1);
        }
    }
    
    drawHUD();
    updatePhase();
    
    const playerWorldX = player.position.x - scrollOffset;
    if (currentPhase === 4 && playerWorldX >= 6000 - 50 && !gameCompleted) {
        gameCompleted = true;
    }
}

// Iniciar
window.addEventListener('load', () => {
    player.position.x = 100;
    
    const musica = new Audio("assets/trilha.mp3");
    musica.loop = true;
    musica.volume = 0.5;

    // Toca quando o usuário clicar no canvas (ou qualquer lugar)
    canvas.addEventListener("click", () => {
    musica.play()
        .then(() => console.log("🎵 Música tocando..."))
        .catch(err => console.warn("⚠️ Navegador bloqueou o áudio:", err));
    });

    // Espera um pouco para garantir que as imagens carreguem
    setTimeout(() => {
        initializeEnemies();
        animate();
        console.log('🎮 Jogo iniciado!');
        
        // Debug: verifica status das imagens
        console.log('type1 status:', enemyImages.type1.complete, enemyImages.type1.naturalWidth);
        console.log('type2 status:', enemyImages.type2.complete, enemyImages.type2.naturalWidth);
        console.log('type3 status:', enemyImages.type3.complete, enemyImages.type3.naturalWidth);
    }, 500);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.position.x = 100;
});