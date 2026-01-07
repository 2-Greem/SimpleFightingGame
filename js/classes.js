class Sprite {
    constructor({position, imageSrc, scale = 1, framesMax = 1, offset = {x: 0, y: 0}}) {
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 10;
        this.offset = offset;
        this.animationLock = false;
    }

    draw() {
        c.drawImage(
            this.image, 
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x, 
            this.position.y - this.offset.y,
            this.image.width / this.framesMax * this.scale,
            this.image.height / 1* this.scale
        )
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
        attackBox = {offset: {}, width: undefined, height: undefined}
    }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
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

        for (const sprite in this.sprites){
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    switchSprite(sprite){
        if (!this.sprites[sprite]) {
            console.error(`Sprite "${sprite}" does not exist.`);
            return;
        }
        
        if (this.image === this.sprites.death.image) {
                if (this.framesCurrent == this.sprites.death.framesMax - 1) {
                // Declare dead on final frame of death animation
                this.isDead = true;
            }
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
        this.animationLock = false;
        if (this.health <= 0){
            this.switchSprite("death");
        } else {
            this.switchSprite("takeHit");
        }
        this.animationLock = true;
    }

    update(){
        this.draw()
        if (!this.isDead) this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
        // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        // Gravity
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 96){
            this.velocity.y = 0;
            this.position.y = 330;
        } else {
            this.velocity.y += gravity;
        }
    }
}