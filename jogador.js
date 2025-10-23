const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravidade = 1;

class Player {
    constructor() {
        this.position = {
            x: 100,
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 1
        }
        this.width = 30;
        this.height = 30;
    }
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravidade;
        } else {
            this.velocity.y = 0;
        }
    }
}

// ...existing code...
class Platform {
    // aceitar parâmetros (com valores padrão) evita `undefined` quando você passar argumentos
    constructor(x = 400, y = 500, width = 200, height = 20) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
    }
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
const player = new Player();
const platforms = [new Platform(400, 300, 200, 20),
new Platform(700, 500, 200, 20),
new Platform(900, 400, 200, 20),
new Platform(1200, 350, 200, 20),
new Platform(1500, 450, 200, 20)
];



player.update(ctx);
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}

let projectiles = [];
let lastShotTime = 0;
const shotCooldown = 100; // ms

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

// dispara horizontal respeitando cooldown
function shootHorizontal(dir = 1) {
    const now = Date.now();
    if (now - lastShotTime < shotCooldown) return; // retorna se em cooldown
    lastShotTime = now;

    const startX = player.position.x + player.width / 2 + dir * (player.width / 2 + 6);
    const startY = player.position.y + player.height / 2;
    const speed = 12 * dir;
    projectiles.push(new Projectile(startX, startY, speed));
}

// tecla Espaço dispara (evita comportamento padrão)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.keyCode === 32) {
        e.preventDefault();
        const dir = player.velocity && player.velocity.x
            ? (player.velocity.x > 0 ? 1 : -1)
            : 1;
        shootHorizontal(dir);
    }
});

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    platforms.forEach(platform => { // Eduardo > movi a parte de colisão da plataforma pra cá, não tava funcionando pq faltava o platform.draw dnv depois
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            console.log('SUBIU');
            player.velocity.y = 0;
        }
        //Eduardo > COLISÃO DE BAIXO PRA CIMA, PRA NÃO ATRAVESSAR A PLATAFORMA SE TIVER SUBINDO E EMBAIXO DAS PLATAFORMAS
        if (player.position.y >= platform.position.y + platform.height &&
            player.position.y + player.velocity.y <= platform.height + platform.position.y &&
            player.position.x + player.velocity.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width &&
            player.velocity.y < 0) {
            console.log('TESTE COLISAO');
            player.velocity.y = 0;
        }
        platform.draw();
    });

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();
        p.draw();
        if (p.position.x < -50 || p.position.x > canvas.width + 50) {
            projectiles.splice(i, 1);
        }
    }
    //Eduardo > aqui tava embaixo do animate, aí n tava scrollando, so subi e ta funcionando
    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = 5;

    } else if (keys.left.pressed && player.position.x > 100) {
        player.velocity.x = -5;
    } else {
        player.velocity.x = 0;
    }

    if (keys.right.pressed) {
        platforms.forEach(platform => {
            platform.position.x -= 5;
        });

    } else if (keys.left.pressed) {
        platforms.forEach(platform => {
            platform.position.x += 5;
        }
        );
    }
}



// Plataforma colisão
//platforms.forEach(platform => {


;



animate();
addEventListener('keydown', ({ keyCode }) => {

    // console.log(keyCode);
    switch (keyCode) {
        case 65: // left arrow
            player.velocity.x = -5;
            keys.left.pressed = true;
            break;
        case 68: // right arrow
            player.velocity.x = 5;
            keys.right.pressed = true;
            break;
        case 87: // up arrow
            player.velocity.y = -20;
            break;
        case 83: // down arrow
            player.velocity.y = 5;
            break;
    }
    //console.log(player.velocity.x, player.velocity.y);
});

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // left arrow
            player.velocity.x = 0;
            keys.left.pressed = false;
            break;
        case 68: // right arrow
            player.velocity.x = 0;
            keys.right.pressed = false;
            break;
    }

});







