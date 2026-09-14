const FLOOR_HEIGHT = 330;

class Sprite {
    constructor({position, imageSrc, scale = 1, framesMax = 1, offset = {x: 0, y: 0}, flipX = false}) {
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax; // total amount of frames in an animation
        this.framesCurrent = 0; // which frame of the animation we are on
        this.framesElapsed = 0; // how many ticks have elapsed total?
        this.framesHold = 10; // How many ticks of animation a frame is held for
        this.offset = offset;
        this.animationLock = false; 
        this.flipX = flipX;
    }

    draw() {
        // This flips the coordinate system to draw the sprite? Weird but it works
        c.save();
        if (this.flipX) {
            c.scale(-1, 1);

            c.drawImage(
                this.image,
                this.framesCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                -(this.position.x - this.offset.x) - (this.image.width / this.framesMax * this.scale),
                this.position.y - this.offset.y,
                this.image.width / this.framesMax * this.scale,
                this.image.height * this.scale
            );
        } else {
            c.drawImage(
                this.image,
                this.framesCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                this.position.x - this.offset.x,
                this.position.y - this.offset.y,
                this.image.width / this.framesMax * this.scale,
                this.image.height * this.scale
            );
        }
        c.restore();
    }

    animateFrames(){
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0){
            if (this.framesCurrent < this.framesMax - 1){
                this.framesCurrent++
            } else {
                this.animationLock = false; // remove lock once an animation is completed
                this.framesCurrent = 0;
            }
        }
    }

    update(){
        this.draw();
        this.animateFrames();
    }
}

class Fighter extends Sprite {
    constructor({   
        position, 
        velocity, 
        color = 'red', 
        offset = {x: 0, y: 0}, 
        imageSrc, 
        scale = 1, 
        framesMax = 1, 
        sprites,
        attackBox = {offset: {}, width: undefined, height: undefined},
        flipX = false
    }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset,
            flipX
        })
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.health = 100;
        this.lastKeyPressed;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        }
        this.colour = color;
        this.isAttacking = false;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.isDead = false;
        this.sprites = sprites;
        this.jumps = 2;
        this.defaultFlip = flipX;
        this.defaultAttackBox = structuredClone(attackBox);

        for (const sprite in this.sprites){
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    animateFrames(){
        // If not dead, animate frames
        if (!this.isDead) super.animateFrames();
        // If in the dying animation, ensure that the isDead attribute is updated on final frame
        if (this.image === this.sprites.death.image && this.framesCurrent == this.sprites.death.framesMax - 1) {
            this.isDead = true;
        }
    }

    switchSprite(sprite, ignoreDeadFlag = false){
        if (!this.sprites[sprite]) {
            console.error(`Sprite "${sprite}" does not exist.`);
            return;
        }
        // Check if in the death animation, ignore this condition if ignoreDeadFlag is true.
        if (this.image === this.sprites.death.image && !ignoreDeadFlag) {
            // Can't change animation on the death animation
            return
        }
        if (this.animationLock){
            // If in an animation lock you can't change animation
            return;
        }
        if (this.image !== this.sprites[sprite].image){ // Condition stops current frame from being reset
            this.image = this.sprites[sprite].image;
            this.framesMax = this.sprites[sprite].framesMax;
            this.framesCurrent = 0;
        }
    }

    attack(){
        // 100 millisecond attack
        this.isAttacking = true;
        this.switchSprite("attack")
        this.animationLock = true;
    }

    takeHit(){
        this.health -= 20;
        this.isAttacking = false; // Getting hit cancels an attack
        this.animationLock = false;
        if (this.health <= 0){
            this.switchSprite("death");
        } else {
            this.switchSprite("takeHit");
        }
        this.animationLock = true;
    }

    update(debug=false){
        this.draw()
        this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
        if (debug){ // When debug it shows the attack boxes
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width/2, this.attackBox.height/2);
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
        
        // X velocity
        const x = this.position.x + this.velocity.x;
        // Ensure you cant move off the screen
        if (x > 924){       // Right Bumper
            this.position.x = 924;
        } else if (x < 0){  // Left Bumper
            this.position.x = 0;
        } else {            // Normal Movement
            this.position.x += this.velocity.x;
        }
        // Friction force applies regardless of movement
        this.velocity.x = Math.trunc(this.velocity.x * friction);
        // Y Velocity
        this.position.y += this.velocity.y;
        // Gravity
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 96){
            this.velocity.y = 0;
            this.position.y = FLOOR_HEIGHT;
            this.jumps = 2;
        } else {
            this.velocity.y += gravity;
        }
    }

    flip(flipDirection = !this.flipX){
        // Slightly unintuitive
        // Calling the function by itself flips the sprite
        // Calling flipX(true) sets the sprite to its flipped state
        // Calling flipX(false) sets the sprite to its unflipped state
        if (flipDirection == this.flipX){
            // If already flipped in the correct direction, do nothing
            return
        } else {
            this.flipX = flipDirection;
            if(this.flipX != this.defaultFlip){
                this.attackBox.offset.x = -this.attackBox.width
            } else {
                this.attackBox.offset.x = this.defaultAttackBox.offset.x
            }
        }
    }

    reset(){
        // Return to life
        this.isDead = false;
        this.health = 100;
        this.animationLock = false;
        this.switchSprite("idle", true)
        // Cleanup Others
        this.isAttacking = false;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.jumps = 2;
        this.lastKeyPressed;
    }
}

class CpuBrain {
    constructor({
        canvasHeight, 
        canvasWidth, 
        minDecisionInterval = 50, 
        maxDecisionInterval = 80, 
        minAttackInterval = 40,
        maxAttackInterval = 100
    }){
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.targetLocation = {x: 0, y: 0};
        this.minDecisionInterval = minDecisionInterval;
        this.maxDecisionInterval = maxDecisionInterval;
        this.decisionIntervalTimer = 0;
        this.decisionInterval = 0;
        this.minAttackInterval = minAttackInterval;
        this.maxAttackInterval = maxAttackInterval;
        this.attackInterval = 60;
        this.attackIntervalTimer = 0;
    }
    setDecisionInterval(){
        this.decisionInterval = Math.random() * (this.maxDecisionInterval - this.minDecisionInterval) + this.minDecisionInterval;
    }
    setAttackInterval(){
        this.attackInterval = Math.random() * (this.maxAttackInterval - this.minAttackInterval) + this.minAttackInterval;
    }
    tickDecisionIntervalTimer(){
        this.decisionIntervalTimer += 1;
        // Change target Location and reset timer
        if (this.decisionIntervalTimer >= this.decisionInterval){
            this.changeTargetLocation();
            this.setDecisionInterval();
            this.decisionIntervalTimer = 0;
            console.log(`Changed Target Location to X: ${this.targetLocation.x}, Y: ${this.targetLocation.y}`)
        }
    }
    tickDecisionAttackTimer(){
        this.attackIntervalTimer += 1;
        if (this.attackIntervalTimer >= this.attackInterval){
            this.attackIntervalTimer = 0;
            this.setAttackInterval();
        }
    }
    tickAllTimers(){
        this.tickDecisionAttackTimer();
        this.tickDecisionIntervalTimer();
    }
    changeTargetLocation(){
        this.targetLocation = { 
            x: Math.random() * (this.canvasWidth - 0) + 0,
            y: Math.random() * (this.canvasHeight + this.canvasHeight) - this.canvasHeight
        }
    }
}