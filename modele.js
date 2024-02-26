class GameObject {
    id;
    positionX;
    positionY;
    sizeX;
    sizeY;

    constructor(positionX, positionY, sizeX, sizeY) {
        this.id = Math.random(); // Unique ID
        this.positionX = positionX;
        this.positionY = positionY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    seDeplace(deltaX, deltaY) {
        this.positionX = this.positionX + deltaX;
        this.positionY = this.positionY + deltaY;
    }

    setsizeX(sizeX) {
        this.sizeX = sizeX;
    }
    setsizeY(sizeY) {
        this.sizeY = sizeY;
    }
}


// ---------------------------
// BUBBLES OBJECTS
//---------------------------
class Bubble extends GameObject {
    speedY;
    speedX;
    direction;
    canBounceback;
    //Parameter of the ellipse representing the bubble :
    //------------------------------
    ae;
    be;
    xc;
    yc;
    //ellipse's equation : (x-xc)/a² + (y-yc)/b² = 1
    //------------------------------

    constructor(positionX, positionY, radius, speedX, direction) {
        super(positionX, positionY, radius, radius);
        this.speedX = speedX;
        this.direction = direction;
        this.canBounceback = true;
        this.calculateEllipsParams();
    }

    bounce(orientationLimite) {
        if (this.canBounceback == true) {
            this.direction = modulo(2 * orientationLimite - this.direction, 360);
        }
    }

    makeBubbleBouncy() {
        this.canBounceback = true;
    }
    disableBubbleBouncy() {
        this.canBounceback = false;
    }

    seDeplace(deltaX, deltaY) {
        super.seDeplace(deltaX, deltaY);
        this.calculateEllipsParams();
    }

    calculateEllipsParams() {
        this.be = this.sizeY / 2; // semi-major axis of the ellipse
        this.ae = this.sizeX / 2; // semi minor axis of the ellipse
        this.xc = this.positionX + this.ae; // ellipse center X
        this.yc = this.positionY + this.be; // ellipse center Y
    }

    setsizeX(sizeX) {
        super.setsizeX(sizeX);
        this.calculateEllipsParams();
    }
    setsizeY(sizeY) {
        super.setsizeY(sizeY);
        this.calculateEllipsParams();
    }

    // When a bubble burst it return 2 new bubbles of a certain type
    burst(typeBulle) {
        var bulle1 = new typeBulle(this.positionX, this.positionY, modulo(this.direction + 45, 180));
        var bulle2 = new typeBulle(this.positionX, this.positionY, modulo(this.direction - 45, 180));
        return [bulle1, bulle2];
    }
}

class BlueBubble extends Bubble {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 20, 0.2, direction);
    }

    burst() {
        return super.burst(GreenBubble);
    }

}

class GreenBubble extends Bubble {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 10, 0.25, direction);
    }

    burst() {
        return super.burst(RedBubble);
    }
}

class RedBubble extends Bubble {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 5, 0.3, direction);
    }

    burst() {
        return [];
    }
}

//------------------------------------------
// PLAYER OBJECT
// -----------------------------------------

class Player extends GameObject {
    lives;
    speed;
    invincible = false;
    opacity = 1;


    constructor(positionX, positionY, lives) {
        super(positionX, positionY, 3, 13);
        this.lives = lives;
        this.speed = 0.5;
    }

    shoot() {
        var arrow = new Arrow(this.positionX + this.sizeX / 2 - 0.25, this.positionY + this.sizeY, 1, 0);
        return arrow;
    }

    hurt() {
        if (!this.invincible) {
            this.lives--;
        }
    }

    makePlayerInvincible() {
        this.invincible = true;
    }

    cancelPlayerinvincibility() {
        this.invincible = false;
    }

    makePlayerTransparent() {
        this.opacity = 0.5;
    }

    makePlayerOpaque() {
        this.opacity = 1;
    }

}

//-------------------------
// ARROW OBJECT
//--------------------------
class Arrow extends GameObject {
    speed;
    direction;

    constructor(positionX, positionY, speed, direction) {
        super(positionX, positionY, 1.1, 10);
        this.speed = speed;
        this.direction = direction
    }
}
//---------------------------------------------------------------------------------------------------------------------------------

//OBSTACLE OBJECT------------------------------------------------------------------------------------------------------------------

class Obstacle extends GameObject {
    orientation;
    isAGameBorder = false;
    color = "red"; //default colour

    //line equation parameters (y = ax + b):
    //---------------------------
    a;
    b;
    //----------------------------
    positionXend;
    positionYend;

    constructor(positionX, positionY, sizeX, sizeY, orientation) {
        super(positionX, positionY, sizeX, sizeY);

        if (orientation > 180 || orientation < 0) {
            throw new Error("Obstacle orientation must be between 0 and 180°!");
        }
        else {
            this.orientation = orientation;

            if (modulo(orientation, 180) != 0 && modulo(orientation, 180) != 180) {
                this.a = Math.tan(modulo((orientation), 180) * 3.14159 / 180);
                this.b = this.positionY - this.a * (this.positionX);
            } else {
                this.a = 0; // not used
                this.b = 0; // not used
            }
        }
        this.calculateEndingCoordinate();
    }

    correctABWithRatio(ratio) {
        let a1 = Math.tan(modulo((90 - this.orientation), 180) * 3.14159 / 180);
        this.a = a1 * ratio;
        this.b = this.positionY - this.a * (this.positionX);
        this.calculateEndingCoordinate();
    }

    calculateEndingCoordinate() {
        //Determining the final coordinates of the segment :
        let A = 1 + this.a * this.a;
        let B = this.positionX * (-2 - 2 * this.a * this.a);
        let C = this.positionX * this.positionX * (1 + this.a * this.a) - this.sizeX * this.sizeX;
        let delta = B * B - 4 * A * C;
        let x11 = (-B - Math.sqrt(delta)) / (2 * A);
        let x12 = (-B + Math.sqrt(delta)) / (2 * A);


        let x1 = Math.max(x11, x12);
        let y1 = this.a * x1 + this.b
        this.positionXend = x1;
        this.positionYend = y1;
    }
}
//--------------------------------------------------------------------------------------------------------------------------


// Game object----------------------------------------------------------------------------------------------------------------
class Game {
    player;
    arrows = [];
    score;
    level;

    constructor(level) {
        this.level = new Level(level);
        this.player = new Player(50, 0, 3);
    }

    startGame() {

        this.level.generateLevel();
    }

    endGame() {
        if (this.player.lives == 0) {
            this.level.levelnumber = 1;
            this.startGame();

        } else {
            this.level.levelnumber++;
            this.startGame();
        }
    }

}

//---------------------------------------------------------------------------------------------------------------------------------

// LEVEL OBJECT---------------------------------------------------------------------------------------------------------------------
//Class describing a level (obstacle and bubble per level)
class Level {
    levelnumber;
    bubbles;
    obstacles;
    backgroundImage;
    time;

    constructor(level) {
        this.levelnumber = level;
        this.generateLevel();
    }

    generateLevel() {
        this.addObstacle();
        this.addBulles();
        switch (this.levelnumber) {
            case 1:
                this.backgroundImage = "level1-Paris.png";
                this.time = 30 * 1000;
                break;
            case 2:
                this.backgroundImage = "level2-Rome.png"
                this.time = 60 * 1000;
                break;

            case 3:
                this.backgroundImage = "level3-London.png"
                this.time = 60 * 1000;
                break;

            case 4:
                this.backgroundImage = "level4-Athena.png"
                this.time = 60 * 1000;
                break;
            case 5:
                this.backgroundImage = "level5-NorvegianFjord.png"
                this.time = 60 * 1000;
                break;
            case 6:
                this.backgroundImage = "game_finished.png"
                this.time = 60 * 1000;
                break;
        }
    }

    //method for generating obstacles according to level. This is how the architecture of each level is described
    addObstacle() {
        this.obstacles = [];
        //In all levels; play area framework :
        //left vertical limit  (X =0, Y = 100, orientation =  180°):
        let limiteVerticaleGauche = new Obstacle(0, 100, 99.9, 0, 180)
        limiteVerticaleGauche.isAGameBorder = true;
        this.obstacles.push(limiteVerticaleGauche);
        //right vertical limit  (X =100, Y = 100, orientation =  180°):
        let limiteVerticaleDroite = new Obstacle(100, 100, 99.9, 0, 180);
        limiteVerticaleDroite.isAGameBorder = true;
        this.obstacles.push(limiteVerticaleDroite);
        // //top horizontal limit  (X =0, Y = 100, sizeX =100, sizeY =0, orientation =  90°):
        let limiteHorizontaleHaute = new Obstacle(0, 99.9, 100, 0, 90);
        limiteHorizontaleHaute.isAGameBorder = true;
        this.obstacles.push(limiteHorizontaleHaute);
        // //bottom horizontal limit  (X =0, Y = 0, sizeX =100, sizeY =0, orientation =  90°):
        let limiteHorizontaleBasse = new Obstacle(0, 0.2, 100, 0, 90);
        limiteHorizontaleBasse.isAGameBorder = true;
        this.obstacles.push(limiteHorizontaleBasse);

        //additional obstacles depending on level :
        switch (this.levelnumber) {
            case 1:
                //obstacles :
                let obstacle1 = new Obstacle(18, 48.5, 18, 0, 90);
                obstacle1.color = "black";
                this.obstacles.push(obstacle1);

                for (var obstacle of this.generateRectangleObstacle(9, 34, 36, 7)) {
                    obstacle.color = "black";
                    this.obstacles.push(obstacle);
                }
                break;
            case 2:
                for (var obstacle of this.generateRectangleObstacle(32, 31, 45, 4)) {
                    obstacle.color = "black";
                    this.obstacles.push(obstacle);
                }
                break;

            case 3:
                let limiteBus1 = new Obstacle(38, 69, 28, 0, 112);
                let limiteBus2 = new Obstacle(39, 45, 26, 0, 99.5);
                let limiteBus3 = new Obstacle(45, 20, 12.5, 0, 87);

                this.obstacles.push(limiteBus1);
                this.obstacles.push(limiteBus2);
                this.obstacles.push(limiteBus3);
                break;

            case 4:
                for (var obstacle of this.generateRectangleObstacle(13, 77, 62, 7)) {
                    obstacle.color = "bisque";
                    this.obstacles.push(obstacle);
                }
                break;

            case 5:
                let pente1 = new Obstacle(55, 42, 15, 0, 55);
                pente1.color = "green";
                let vertical1 = new Obstacle(66.5, 76, 21, 0, 180);
                vertical1.color = "green";

                let pente2 = new Obstacle(13, 90, 32, 0, 155);
                pente2.color = "green";
                let pente3 = new Obstacle(23, 57, 24, 0, 118);
                pente3.color = "green";

                this.obstacles.push(pente1);
                this.obstacles.push(vertical1);
                this.obstacles.push(pente2);
                this.obstacles.push(pente3);

                break;
            default:
                break;
        }
    }

    addBulles() {
        this.bubbles = [];
        switch (this.levelnumber) {
            default:
                // only 1 blue bubble
                // for (let bubble of this.generateBubbles("blue", 1, 0, 100, 48, 100, 135, 225)) {
                //     this.bubbles.push(bubble);
                // }
                break;

            case 1:
                // only 1 blue bubble
                for (let bubble of this.generateBubbles("blue", 1, 0, 100, 48, 100, 135, 225)) {
                    this.bubbles.push(bubble);
                }
                break;

            case 2:
                for (let bubble of this.generateBubbles("blue", 2, 0, 100, 53, 100, 135, 225)) {
                    this.bubbles.push(bubble);
                }
                break;

            case 3:
                for (let bubble of this.generateBubbles("blue", 3, 0, 100, 53, 100, 135, 225)) {
                    this.bubbles.push(bubble);
                }
                break;

            case 4:
                for (let bubble of this.generateBubbles("blue", 3, 0, 100, 15, 75, 135, 225)) {
                    this.bubbles.push(bubble);
                }
                for (let bubble of this.generateBubbles("green", 1, 13, 75, 77, 100, 110, 165)) {
                    this.bubbles.push(bubble);
                }
                break;

            case 5:
                for (let bubble of this.generateBubbles("green", 8, 13, 66, 48, 100, 135, 225)) {
                    this.bubbles.push(bubble);
                }
                break;
        }

    }

    generateRectangleObstacle(X, Y, width, height) {
        var obstacles = [];
        // border top of rectangle
        obstacles.push(new Obstacle(X, Y, width, 0, 90));
        //border bottom of rectangle
        obstacles.push(new Obstacle(X, Y - height, width, 0, 90));
        //left vertical border of rectangle
        obstacles.push(new Obstacle(X, Y, height, 0, 180));
        //right vertical border of rectangle
        obstacles.push(new Obstacle(X + width, Y, height, 0, 180));

        return obstacles;
    }

    generateBubbles(typeofBubble, numberOfBubble, minXPosition, maxXPosition, minYPosition, maxYPosition, minStartingDirection, maxStartingDirection) {
        var generatedBubbles = [];
        if (minXPosition >= 0 && maxXPosition <= 100 && minYPosition >= 0 && minYPosition <= 100 && minStartingDirection >= 0 && maxStartingDirection <= 360) {
            for (let i = 0; i < numberOfBubble; i++) {
                // random direction between chosen min and max direction
                let direction = getRandomIntegerInInterval(minStartingDirection, maxStartingDirection);

                //instance of a bubble depending on choosen type :
                switch (typeofBubble) {
                    case "blue":
                        var bulle = new BlueBubble(0, 0, direction);
                        break;
                    case "green":
                        var bulle = new GreenBubble(0, 0, direction);
                        break;
                    case "red":
                        var bulle = new RedBubble(0, 0, direction);
                        break;
                    default:
                        var bulle = new BlueBubble(0, 0, direction);
                        break;
                }

                let positionX = getRandomIntegerInInterval(bulle.sizeX + minXPosition, maxXPosition - bulle.sizeX);
                let positionY = getRandomIntegerInInterval(bulle.sizeY + minYPosition, maxYPosition - bulle.sizeY);
                bulle.seDeplace(positionX, positionY);
                generatedBubbles.push(bulle);
            }
        } else {
            console.log("bubble direction or position not coherent; no bubles created");
        }
        return generatedBubbles;
    }
}
//----------------------------------------------------------------------------------------------------------------------------------


