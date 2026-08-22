const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // canvas context

canvas.width = 1024;
canvas.height = 576;

// Co-ordinates start at the top left (0, 0)
c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.5;
const friction = 0.3;
const timerMax = 60
const isDebug = true; // debug mode adds the attack boxes
let timer = timerMax;
let timerId;
let isAIplaying = false;

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
    position: { x: 200, y: 100 },
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
            imageSrc: './img/Martial Hero/Sprites/TakeHit.png',
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
        position: { x: 800, y: 100 },
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
                imageSrc: './img/Martial Hero 2/Sprites/TakeHit.png',
                framesMax: 3,
            },
            death: {
                imageSrc: './img/Martial Hero 2/Sprites/Death.png',
                framesMax: 7,
            }
        },
        attackBox: {
            offset: {
                x: 60,
                y: -10
            },
            height: 150,
            width: 180
        },
        flipX: true
    });

const cpuPlayer = new CpuBrain({
    canvasHeight: canvas.height, 
    canvasWidth: canvas.width
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

function reset(){
    // Player 1 Stat Reset
    player.reset();
    player.position = { x: 200, y: 100 };
    player.velocity = { x: 0, y: 0 };
    // Update P1 Health UI
    gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    // Player 2 Stat Reset
    enemy.reset();
    enemy.position = { x: 800, y: 100 };
    enemy.velocity = { x: 0, y: 0 };
    // Update P2 Health UI
    gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    // Clear Winner Declaration
    document.querySelector("#displayText").style.display = 'none';
    // Restart Timer
    timer = timerMax;
    decreaseTimer()
}

function messyDirectionChecker(){
    if (player.position.x > enemy.position.x){
        // If P1 is on the right
        player.flip(true);
        enemy.flip(true);
    } else {
        // if P2 is on the right
        player.flip(false);
        enemy.flip(false);
    }
}

// infinite loop
function animate(){
    window.requestAnimationFrame(animate)
    // Clears the screen by superimposing the background over everything
    background.update();
    shop.update();
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height);
    messyDirectionChecker();
    player.update(isDebug);
    enemy.update(isDebug);

    // Player button movement
    if (keys.a.pressed && player.lastKeyPressed == 'a'){
        player.velocity.x = -10;
        player.switchSprite("run");
    } else if (keys.d.pressed && player.lastKeyPressed == 'd'){
        player.velocity.x = 10;
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
    if (!isAIplaying){
        if (keys.ArrowLeft.pressed && enemy.lastKeyPressed == 'ArrowLeft'){
            enemy.velocity.x = -10;
            enemy.switchSprite("run");
        } else if (keys.ArrowRight.pressed && enemy.lastKeyPressed == 'ArrowRight'){
            enemy.velocity.x = 10;
            enemy.switchSprite("run");
        } else {
            enemy.switchSprite("idle");
        }
    } else if (!enemy.isDead && timer > 0){ // and implied ai is playing - // Enemy CPU movement
        cpuPlayer.tickDecisionIntervalTimer();
        if (Math.abs(enemy.position.x - cpuPlayer.targetLocation.x) < 20){
            // if its close enough, go idle and stop moving
            enemy.switchSprite("idle");
        } else if (enemy.position.x > cpuPlayer.targetLocation.x){
            enemy.velocity.x = -10;
            enemy.switchSprite("run");
        } else if (enemy.position.x < cpuPlayer.targetLocation.x){
            enemy.velocity.x = 10;
            enemy.switchSprite("run");
        }
        // Why does the below commented block break the movement of the cpu?

        // if (enemy.velocity.x = 0){
        //     enemy.switchSprite("run");
        // }

        // Cpu y axis movement logic
        if (enemy.jumps > 0 && cpuPlayer.targetLocation.y > enemy.position.y) {
            enemy.jumps -= 1;
            enemy.velocity.y = -15;
        } 
    }
        // Y axis sprite movement is universal and overides all other movement
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
        timer = 0; //FIX: Hacky Fix, move this somewhere more intuitive
        determineWinner({player: player, enemy: enemy, timerId: timerId})
    }
}

decreaseTimer()
animate()


// Pressed Keys Event Listeners

window.addEventListener('keydown', (event) => {

    // occurs regardless of player deaths
    switch(event.key) {
        case 'r':
            isAIplaying = false;
            reset();
            break;
        case 't':
            isAIplaying = true;
            reset();
            break;
    }

    if (!player.isDead && timer > 0){
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
                if (player.jumps > 0) {
                    player.jumps -= 1;
                    player.velocity.y = -15;
                }                
                break;
            case ' ':
                player.attack();
                break;
        }
    }
    if (!enemy.isDead && timer > 0 && !isAIplaying){
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
                if (enemy.jumps > 0) {
                    enemy.jumps -= 1;
                    enemy.velocity.y = -15;
                }
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
    }
    // Enemy Controls
    if (!isAIplaying){
        switch (event.key){
            case 'ArrowRight':
                keys.ArrowRight.pressed = false;
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = false;
                break
        }
    }
})

// Removes the default page scrolling behaviour on the arrow keys
window.addEventListener("keydown", function(e) {
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, { passive: false });
