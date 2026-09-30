const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // canvas context

canvas.width = 1024;
canvas.height = 576;

// Co-ordinates start at the top left (0, 0)
c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.5;
const friction = 0.3;
const timerMax = 120
const isDebug = false; // debug mode adds the attack boxes
let timer = timerMax;
let timerId;
let isAIplaying = false;
let nextGameAiPlayer = false;

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

// Intialise Players
const player = MartialHero1;
const enemy = MartialHero2;
// Place players in location according to role
player.position = { x: 200, y: 100 }
enemy.position = { x: 800, y: 100 }

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

function reset(activateAiPlayer = true){
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

    // Activate CPU or Player
    isAIplaying = activateAiPlayer;

    // Restart Timer
    timer = timerMax;
    decreaseTimer()
}

function messyDirectionChecker(){
    if (player.position.x > enemy.position.x){
        // If P1 is on the right
        player.flip(true);
        enemy.flip(false);
    } else {
        // if P2 is on the right
        player.flip(false);
        enemy.flip(true);
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
        // Y axis sprite movement is universal and overides all other movement
        if (enemy.velocity.y < 0) {
            enemy.switchSprite("jump");
        } else if (enemy.velocity.y > 0) {
            enemy.switchSprite("fall");
        }
    } else if (!enemy.isDead){ // and implied ai is playing - // Enemy CPU movement
        // Top to bottom is animation Priority, with top being lowest
        // Active Movements - Timer > 0
        if (timer > 0) {
            cpuPlayer.tickAllTimers();
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

            // Cpu jump logic
            if (enemy.jumps > 0 && cpuPlayer.targetLocation.y > enemy.position.y) {
                enemy.jumps -= 1;
                enemy.velocity.y = -15;
            } 
        }
        // Passive Movements - Occur Regardless of timer

        // Y axis sprite movement is universal and overides all other movement
        if (enemy.velocity.y < 0) {
            enemy.switchSprite("jump");
        } else if (enemy.velocity.y > 0) {
            enemy.switchSprite("fall");
        }

        // Active Movement - Only attack if in time
        if (timer > 0) {
            if (cpuPlayer.attackIntervalTimer == 0){
                enemy.attack();
            }
        }

        // Sets to idle when match ends
        if (player.health <= 0) {
            enemy.switchSprite("idle");
        }
    }

    

    // Player Attack box collision
    if (player.isAttacking &&
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.framesCurrent === player.sprites["attack"].framesMax - 1 // second last frame of attack
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
        enemy.framesCurrent === enemy.sprites["attack"].framesMax - 1 // second last frame of attack
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
            reset(nextGameAiPlayer);
            break;
        case 't':
            // Toggles wether the AI or Player will be in control next round
            nextGameAiPlayer = !nextGameAiPlayer
            displayCpuToggle(nextGameAiPlayer);
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
            case 's':
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
