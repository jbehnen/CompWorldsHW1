function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    // call the entity code (basically the constructor), attach it to Background instead of Entity
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

// INHERITANCE
Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

// overrides the draw method
Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Luke(game) {
    // this animation starts at the top left, but runs in reverse
    // 46 across
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/LukeRun.png"), 0, 20, 64, 76, 0.05, 8, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/LukeJumpAttack.png"), 0, 0, 128, 96, 0.03, 10, false, false);
    this.jumping = false;
    this.jumpFrame = 0;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Luke.prototype = new Entity();
Luke.prototype.constructor = Luke;

Luke.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
            this.jumpFrame = 0;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 40;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    this.x += 3 * this.game.clockTick * 50; // scales the distance moved to elapsed time
    Entity.prototype.update.call(this);
}

Luke.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x - 32, this.y - 18 + 26);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y + 26);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/LukeRun.png");
ASSET_MANAGER.queueDownload("./img/LukeJumpAttack.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var luke = new Luke(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(luke);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
