class ObjetJeu {
    id;
    positionX;
    positionY;
    tailleX;
    tailleY;

    constructor(positionX, positionY, tailleX, tailleY) {
        this.id = Math.random(); // Unique ID
        this.positionX = positionX;
        this.positionY = positionY;
        this.tailleX = tailleX;
        this.tailleY = tailleY;
    }

    seDeplace(deltaX, deltaY) {
        this.positionX = this.positionX + deltaX;
        this.positionY = this.positionY + deltaY;
    }

    setTailleX(tailleX) {
        this.tailleX = tailleX;
    }
    setTailleY(tailleY) {
        this.tailleY = tailleY;
    }
}


// OBJETS BULLES -------------------------------------------------------------------------------------------------------------
class Bulle extends ObjetJeu {
    vitesseY;
    vitesseX;
    direction;
    //Parametre de l'ellipse représentant la bulle :
    //------------------------------
    ae;
    be;
    xc;
    yc;
    //Equation de l'ellipse : (x-xc)/a² + (y-yc)/b² = 1
    //------------------------------

    constructor(positionX, positionY, rayon, vitesseX, direction) {
        super(positionX, positionY, rayon, rayon);
        this.vitesseX = vitesseX;
        this.direction = direction;
        this.calculateEllipsParams();
    }



    rebondi(orientationLimite) {
        this.direction = modulo(2 * orientationLimite - this.direction, 360);
    }

    seDeplace(deltaX, deltaY) {
        super.seDeplace(deltaX, deltaY);
        this.calculateEllipsParams();
    }

    calculateEllipsParams() {
        this.be = this.tailleY / 2; // demi grand axe de l'ellipse
        this.ae = this.tailleX / 2; // demi petit axe de l'ellipse
        this.xc = this.positionX + this.ae; // centre de l'ellipse
        this.yc = this.positionY + this.be; // centre de l'elli^se
    }

    setTailleX(tailleX) {
        super.setTailleX(tailleX);
        this.calculateEllipsParams();
    }
    setTailleY(tailleY) {
        super.setTailleY(tailleY);
        this.calculateEllipsParams();
    }


    eclate(typeBulle) {
        var bulle1 = new typeBulle(this.positionX, this.positionY, modulo(this.direction + 45, 180));
        var bulle2 = new typeBulle(this.positionX, this.positionY, modulo(this.direction - 45, 180));
        return [bulle1, bulle2];
    }
}

class BulleBleue extends Bulle {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 20, 0.2, direction);

    }


    eclate() {
        return super.eclate(BulleVerte);
    }

}

class BulleVerte extends Bulle {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 10, 0.25, direction);
    }

    eclate() {
        return super.eclate(BulleRouge);

    }
}

class BulleRouge extends Bulle {
    constructor(positionX, positionY, direction) {
        super(positionX, positionY, 5, 0.3, direction);
    }

    eclate() {
        return [];
    }
}
//----------------------------------------------------------------------------------------------------------------------------------

//OBJET JOUEUR----------------------------------------------------------------------------------------------------------------------

class Joueur extends ObjetJeu {
    pointDeVie;
    vitesse;
    invincible = false;
    opacity = 1;


    constructor(positionX, positionY, pointDeVie) {
        super(positionX, positionY, 3, 13);

        this.pointDeVie = pointDeVie;
        this.vitesse = 0.5;

    }

    tire() {

        var fleche = new Fleche(this.positionX + this.tailleX / 2 - 0.25, this.positionY + this.tailleY, 1, 0);

        return fleche;
    }

    estBlesse() {
        if (!this.invincible) {
            this.pointDeVie--;
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
//----------------------------------------------------------------------------------------------------------------------------------

//OBJET FLECHE---------------------------------------------------------------------------------------------------------------------
class Fleche extends ObjetJeu {
    vitesse;
    direction;

    constructor(positionX, positionY, vitesse, direction) {
        super(positionX, positionY, 1.1, 10);
        this.vitesse = vitesse;
        this.direction = direction
    }
}
//---------------------------------------------------------------------------------------------------------------------------------

//OBSTACLE OBJECT------------------------------------------------------------------------------------------------------------------

class Obstacle extends ObjetJeu {
    orientation;
    bordure = false;
    couleur = "red"; //default colour

    //line equation parameters (y = ax + b):
    //---------------------------
    a;
    b;
    //----------------------------
    positionXend;
    positionYend;

    constructor(positionX, positionY, tailleX, tailleY, orientation) {
        super(positionX, positionY, tailleX, tailleY);

        if (orientation > 180 || orientation < 0) {
            throw new Error("L'orientation de l'obstacle doit ête compris en 0 et 180°! ");
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
        let C = this.positionX * this.positionX * (1 + this.a * this.a) - this.tailleX * this.tailleX;
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


// OBJET PARTIE-----------------------------------------------------------------------------------------------------------------
class Game {
    player;
    arrows = [];
    score;
    level;

    constructor(niveau) {


        this.level = new Level(niveau);
        this.player = new Joueur(50, 0, 3);
    }

    startGame() {

        this.level.generateLevel();
    }

    endGame() {
        if (this.player.pointDeVie == 0) {
            this.level.levelnumber = 1;
            this.startGame();

        } else {
            this.level.levelnumber++;
            this.startGame();
        }
    }

}

//---------------------------------------------------------------------------------------------------------------------------------

// OBJET LEVEL---------------------------------------------------------------------------------------------------------------------
//Classe décrivant les différents niveau (obstacle et bulle par niveau)
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

    //méthode générant les obstacles suivant le niveau. C'est ainsi ici qu'(est décrit l'architecture de chaque niveau)
    addObstacle() {
        this.obstacles = [];
        //Dans tous les niveaux : cadre de l'aire de jeu :
        //limite verticale gauche  (X =0, Y = 100, orientation =  180°):
        let limiteVerticaleGauche = new Obstacle(0, 100, 99.9, 0, 180)
        limiteVerticaleGauche.bordure = true;
        this.obstacles.push(limiteVerticaleGauche);
        //limite verticale droite  (X =100, Y = 100, orientation =  180°):
        let limiteVerticaleDroite = new Obstacle(100, 100, 99.9, 0, 180);
        limiteVerticaleDroite.bordure = true;
        this.obstacles.push(limiteVerticaleDroite);
        // //limite horizontale haute  (X =0, Y = 100, tailleX =100, tailleY =0, orientation =  90°):
        let limiteHorizontaleHaute = new Obstacle(0, 99.9, 100, 0, 90);
        limiteHorizontaleHaute.bordure = true;
        this.obstacles.push(limiteHorizontaleHaute);
        // //limite horizontale bas  (X =0, Y = 0, tailleX =100, tailleY =0, orientation =  90°):
        let limiteHorizontaleBasse = new Obstacle(0, 0.2, 100, 0, 90);
        limiteHorizontaleBasse.bordure = true;
        this.obstacles.push(limiteHorizontaleBasse);

        //obstacles supplémentaire en fonction du niveau :
        switch (this.levelnumber) {
            case 1:
                //obstacles :
                //let obstacle1 = new Obstacle(73, 48.5, 20, 0, 90);
                let obstacle1 = new Obstacle(18, 48.5, 18, 0, 90);
                obstacle1.couleur = "black";
                this.obstacles.push(obstacle1);

                for (var obstacle of this.generateRectangleObstacle(9, 34, 36, 7)) {
                    obstacle.couleur = "black";
                    this.obstacles.push(obstacle);
                }
                break;
            case 2:
                for (var obstacle of this.generateRectangleObstacle(32, 31, 45, 4)) {
                    obstacle.couleur = "black";
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
                    obstacle.couleur = "bisque";
                    this.obstacles.push(obstacle);
                }
                break;

            case 5:
                let pente1 = new Obstacle(55, 42, 15, 0, 55);
                pente1.couleur = "green";
                let vertical1 = new Obstacle(66.5, 76, 21, 0, 180);
                vertical1.couleur = "green";

                let pente2 = new Obstacle(13, 90, 32, 0, 155);
                pente2.couleur = "green";
                let pente3 = new Obstacle(23, 57, 24, 0, 118);
                pente3.couleur = "green";

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
        //horizontal haut du rectangle
        obstacles.push(new Obstacle(X, Y, width, 0, 90));
        //horizontal bas du rectangle
        obstacles.push(new Obstacle(X, Y - height, width, 0, 90));
        //verticale gauche du rectangle
        obstacles.push(new Obstacle(X, Y, height, 0, 180));
        //verticale droite du rectangle
        obstacles.push(new Obstacle(X + width, Y, height, 0, 180));

        return obstacles;
    }

    generateBubbles(typeofBubble, numberOfBubble, minXPosition, maxXPosition, minYPosition, maxYPosition, minStartingDirection, maxStartingDirection) {
        var generatedBubbles = [];
        if (minXPosition >= 0 && maxXPosition <= 100 && minYPosition >= 0 && minYPosition <= 100 && minStartingDirection >= 0 && maxStartingDirection <= 360) {
            for (let i = 0; i < numberOfBubble; i++) {
                // random direction between chosen min and max direction
                let direction = getRandomIntegerInInterval(minStartingDirection, maxStartingDirection);

                //Isntance of a bubble depending on choosen type :
                switch (typeofBubble) {
                    case "blue":
                        var bulle = new BulleBleue(0, 0, direction);
                        break;
                    case "green":
                        var bulle = new BulleVerte(0, 0, direction);
                        break;
                    case "red":
                        var bulle = new BulleRouge(0, 0, direction);
                        break;
                    default:
                        var bulle = new BulleBleue(0, 0, direction);
                        break;
                }

                let positionX = getRandomIntegerInInterval(bulle.tailleX + minXPosition, maxXPosition - bulle.tailleX);
                let positionY = getRandomIntegerInInterval(bulle.tailleY + minYPosition, maxYPosition - bulle.tailleY);
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


