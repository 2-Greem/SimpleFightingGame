const MartialHero1 = new Fighter({
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
        height: 180,
        width: 200
    }
});

const MartialHero2 = new Fighter({
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
    flipX: false
});

const Huntress = new Fighter({
    position: { x: 800, y: 100 },
    velocity: { x: 0, y: 0 },
    imageSrc: './img/huntress/Sprites/Idle.png',
    framesMax: 8,
    scale: 3,
    color: 'green' ,
    offset: { x: 150, y: 140 },
    sprites: {
        idle: {
            imageSrc: './img/Huntress/Sprites/Idle.png',
            framesMax: 8,
        },
        run: {
            imageSrc: './img/Huntress/Sprites/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/Huntress/Sprites/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/Huntress/Sprites/Fall.png',
            framesMax: 2,
        },
        attack: {
            imageSrc: './img/Huntress/Sprites/Attack2.png',
            framesMax: 5,
        },
        takeHit: {
            imageSrc: './img/Huntress/Sprites/TakeHit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/Huntress/Sprites/Death.png',
            framesMax: 8,
        }
    },
    attackBox: {
        offset: {
            x: 90,
            y: -60
        },
        height: 220,
        width: 150
    },
    flipX: false,
    spriteWidth: -60
});