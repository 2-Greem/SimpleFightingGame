const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // canvas context

canvas.width = 1024;
canvas.height = 576;

// Co-ordinates start at the top left (0, 0)
c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.5;
let timer = 60;
let timerId;

const background = new Sprite({
    position: { x: 0, y:0 },
    imageSrc: "./img/background.png"
})

const shop = new Sprite({
    position: { x: 600, y: 128 },
    imageSrc: "./img/shop.png",
    scale: 2.75,
    framesMax: 6
})

const player = new Fighter({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    imageSrc: './img/Martial Hero/Sprites/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: { x: 215, y: 157},
    sprites: {
        idle: {
            imageSrc: './img/Martial Hero/Sprites/Idle.png',
            framesMax: 8,
        },
        run: {
            imageSrc: './img/Martial Hero/Sprites/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/Martial Hero/Sprites/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/Martial Hero/Sprites/Fall.png',
            framesMax: 2,
        },
        attack: {
            imageSrc: './img/Martial Hero/Sprites/Attack1.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './img/Martial Hero/Sprites/Take hit.png',
            framesMax: 4,
        },
        death: {
            imageSrc: './img/Martial Hero/Sprites/Death.png',
            framesMax: 6,
        }
    },
    attackBox: {
        offset: {
            x: 60,
            y: -20
        },
        height: 160,
        width: 190
    }
});

const enemy = new Fighter({
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: 0 },
        imageSrc: './img/Martial Hero 2/Sprites/Idle.png',
        framesMax: 4,
        scale: 2.5,
        color: 'blue' ,
        offset: { x: 215, y: 170 },
        sprites: {
            idle: {
                imageSrc: './img/Martial Hero 2/Sprites/Idle.png',
                framesMax: 4,
            },
            run: {
                imageSrc: './img/Martial Hero 2/Sprites/Run.png',
                framesMax: 8,
            },
            jump: {
                imageSrc: './img/Martial Hero 2/Sprites/Jump.png',
                framesMax: 2,
            },
            fall: {
                imageSrc: './img/Martial Hero 2/Sprites/Fall.png',
                framesMax: 2,
            },
            attack: {
                imageSrc: './img/Martial Hero 2/Sprites/Attack1.png',
                framesMax: 4,
            },
            takeHit: {
                imageSrc: './img/Martial Hero 2/Sprites/Take hit.png',
                framesMax: 3,
            },
            death: {
                imageSrc: './img/Martial Hero 2/Sprites/Death.png',
                framesMax: 7,
            }
        },
        attackBox: {
            offset: {
                x: -170,
                y: -10
            },
            height: 150,
            width: 180
    }
    });

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }

}

decreaseTimer()

// infinite loop
function animate(){
    window.requestAnimationFrame(animate)
    // Clears the screen by superimposing the background over everything
    background.update();
    shop.update();
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    // Player button movement
    player.velocity.x = 0;
    // player.image = player.sprites.idle.image;
    if (keys.a.pressed && player.lastKeyPressed == 'a'){
        player.velocity.x = -5;
        player.switchSprite("run");
    } else if (keys.d.pressed && player.lastKeyPressed == 'd'){
        player.velocity.x = 5;
        player.switchSprite("run");
    } else {
        player.switchSprite("idle");
    }
    if (player.velocity.y < 0) {
        player.switchSprite("jump");
    } else if (player.velocity.y > 0) {
        player.switchSprite("fall");
    }
    // Enemy button movement
    enemy.velocity.x = 0;
    if (keys.ArrowLeft.pressed && enemy.lastKeyPressed == 'ArrowLeft'){
        enemy.velocity.x = -5;
        enemy.switchSprite("run");
    } else if (keys.ArrowRight.pressed && enemy.lastKeyPressed == 'ArrowRight'){
        enemy.velocity.x = 5;
        enemy.switchSprite("run");
    } else {
        enemy.switchSprite("idle");
    }
    if (enemy.velocity.y < 0) {
        enemy.switchSprite("jump");
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite("fall");
    }

    // Player Attack box collision
    if (player.isAttacking &&
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.framesCurrent === 4
    ){
        enemy.takeHit()
        player.isAttacking = false; // only hit once
        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // if player miss
    if (player.isAttacking && player.framesCurrent > 4){
        player.isAttacking = false;
    }

    // Enemy Attack box collision
    if (enemy.isAttacking &&
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.framesCurrent === 2
    ){
        player.takeHit();
        enemy.isAttacking = false; // only hit once
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    if (enemy.isAttacking && enemy.framesCurrent > 2){
        enemy.isAttacking = false;
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0){
        determineWinner({player: player, enemy: enemy, timerId: timerId})
    }
}

animate()

// Pressed Keys Event Listeners

window.addEventListener('keydown', (event) => {
    if (!player.isDead){
        switch (event.key) {
            case 'd':
                keys.d.pressed = true;
                player.lastKeyPressed = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKeyPressed = 'a';
                break
            case 'w':
                player.velocity.y = -15;
                break;
            case ' ':
                player.attack();
                break;
        }
    }
    if (!enemy.isDead){
        switch(event.key) {
            // Enemy Controls
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKeyPressed = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKeyPressed = 'ArrowLeft';
                break
            case 'ArrowUp':
                enemy.velocity.y = -15;
                break;
            case 'ArrowDown':
                enemy.attack();
                break;
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        // Enemy Controls
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break
    }
})
