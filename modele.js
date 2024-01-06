class ObjetJeu {
    id;
    positionX;
    positionY;
    tailleX;
    tailleY;

    constructor(positionX, positionY, tailleX, tailleY) {
        this.id = Math.random(); // Génération d'un ID unique
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

/*//Déclaration classe javascript syntaxe de base :
// var ObjetJeu = function (positionX, positionY) {
//     this.positionX = positionX;
//     this.positionY = positionY;
//     this.id = Math.random();

// }

// ObjetJeu.prototype.seDeplace = function (deltaX, deltaY) {

// }

//------------------------*/



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

        //FAIRE SETETTER DE TAILLE X et TAILLE Y et fonction RECALCUL DE ae et be !!
    }



    rebondi(orientationLimite) {
        this.direction = modulo(2 * orientationLimite - this.direction, 360);
    }

    checkCollision(joueur, tableauFleches) {
        // A mettre dans le controleur
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

//OBJET OBSTACLE------------------------------------------------------------------------------------------------------------------

class Obstacle extends ObjetJeu {
    orientation;
    bordure = false;
    couleur = "red";
    //parametre de l'équation représentant la droite :
    //---------------------------
    a;
    b;
    // equation : y = ax + b
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
                //this.a = Math.tan(modulo((90 - orientation), 180) * 3.14159 / 180);
                this.b = this.positionY - this.a * (this.positionX);
            } else {
                this.a = 0; // ne sera pas utilisé
                this.b = 0; // ne sera pas utilisé
            }
        }
    }

    correctABWithRatio(ratio) {
        let a1 = Math.tan(modulo((90 - this.orientation), 180) * 3.14159 / 180);
        console.log("a1 : " + a1);
        this.a = a1 * ratio;
        this.b = this.positionY - this.a * (this.positionX);
        this.calculateEndingCoordinate();
    }

    calculateEndingCoordinate() {
        //Détermination des coordonnées finales du segment :
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
class Partie {

    joueur;
    tableauFleche = [];

    score;

    niveau;

    constructor(niveau) {


        this.niveau = new Level(niveau);
        this.joueur = new Joueur(50, 0, 3);
    }

    commencerPartie() {

        this.niveau.generateLevel();
    }

    terminerPartie() {
        if (partie.joueur.pointDeVie == 0) {
            this.niveau.level = 1;
            this.commencerPartie();

        } else {
            this.niveau.level++;
            this.commencerPartie();
        }
    }

}

//---------------------------------------------------------------------------------------------------------------------------------

// OBJET LEVEL---------------------------------------------------------------------------------------------------------------------
//Classe décrivant les différents niveau (obstacle et bulle par niveau)
class Level {
    level;
    tableauBulles;
    tableauObstacles;
    backgroundImage;
    time;

    constructor(level) {
        this.level = level;
        this.generateLevel();
    }

    generateLevel() {
        this.generateObstacle();
        this.generateBulles();
        switch (this.level) {
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
        }
    }

    //méthode générant les obstacles suivant le niveau. C'est ainsi ici qu'(est décrit l'architecture de chaque niveau)
    generateObstacle() {
        this.tableauObstacles = [];
        //Dans tous les niveaux : cadre de l'aire de jeu :
        //limite verticale gauche  (X =0, Y = 100, orientation =  180°):
        let limiteVerticaleGauche = new Obstacle(0, 100, 99.9, 0, 180)
        limiteVerticaleGauche.bordure = true;
        this.tableauObstacles.push(limiteVerticaleGauche);
        //limite verticale droite  (X =100, Y = 100, orientation =  180°):
        let limiteVerticaleDroite = new Obstacle(100, 100, 99.9, 0, 180);
        limiteVerticaleDroite.bordure = true;
        this.tableauObstacles.push(limiteVerticaleDroite);
        // //limite horizontale haute  (X =0, Y = 100, tailleX =100, tailleY =0, orientation =  90°):
        let limiteHorizontaleHaute = new Obstacle(0, 99.9, 100, 0, 90);
        limiteHorizontaleHaute.bordure = true;
        this.tableauObstacles.push(limiteHorizontaleHaute);
        // //limite horizontale bas  (X =0, Y = 0, tailleX =100, tailleY =0, orientation =  90°):
        let limiteHorizontaleBasse = new Obstacle(0, 0.2, 100, 0, 90);
        limiteHorizontaleBasse.bordure = true;
        this.tableauObstacles.push(limiteHorizontaleBasse);

        //obstacles supplémentaire en fonction du niveau :
        switch (this.level) {
            case 1:
                //couleur :
                let couleur = "black";

                //obstacles :
                //let obstacle1 = new Obstacle(73, 48.5, 20, 0, 90);
                let obstacle1 = new Obstacle(18, 48.5, 18, 0, 90);
                obstacle1.couleur = couleur;
                this.tableauObstacles.push(obstacle1);

                for (var obstacle of this.generateRectangleObstacle(9, 34, 36, 7)) {
                    obstacle.couleur = couleur;
                    this.tableauObstacles.push(obstacle);
                }

                break;
            case 2:
                for (var obstacle of this.generateRectangleObstacle(32, 31, 45, 4)) {
                    this.tableauObstacles.push(obstacle);
                }
                break;

            case 3:

                let limiteBus1 = new Obstacle(38, 69, 28, 0, 112);
                let limiteBus2 = new Obstacle(39, 45, 26, 0, 99.5);
                let limiteBus3 = new Obstacle(45, 20, 12.5, 0, 87);
                limiteBus1.couleur = "black";
                limiteBus2.couleur = "black";
                limiteBus3.couleur = "black";

                this.tableauObstacles.push(limiteBus1);
                this.tableauObstacles.push(limiteBus2);
                this.tableauObstacles.push(limiteBus3);
                break;
        }
    }

    generateBulles() {
        this.tableauBulles = [];

        switch (this.level) {
            case 1:
                //let direction = Math.floor(Math.random() * (225 - 135)) + 135;
                let direction = getRandomIntegerInInterval(135, 225);
                var bulle1 = new BulleBleue(0, 0, direction);
                // let positionX = Math.floor(Math.random() * (100 - 2 * bulle1.tailleX)) + bulle1.tailleX;
                // let positionY = Math.floor(Math.random() * (100 - 2 * bulle1.tailleY)) + bulle1.tailleY;
                let positionX = getRandomIntegerInInterval(bulle1.tailleX, 100 - bulle1.tailleX);
                let positionY = getRandomIntegerInInterval(bulle1.tailleY + 48, 100 - bulle1.tailleY);
                bulle1.seDeplace(positionX, positionY);
                this.tableauBulles.push(bulle1);
                break;

            case 2:
                for (let i = 0; i < 2; i++) {
                    //let direction = Math.floor(Math.random() * (225 - 135)) + 135;
                    let direction = getRandomIntegerInInterval(135, 225);
                    var bulle1 = new BulleBleue(0, 0, direction);
                    // let positionX = Math.floor(Math.random() * (100 - 2 * bulle1.tailleX)) + bulle1.tailleX;
                    // let positionY = Math.floor(Math.random() * (100 - 2 * bulle1.tailleY - 53)) + bulle1.tailleY + 53;
                    let positionX = getRandomIntegerInInterval(bulle1.tailleX, 100 - bulle1.tailleX);
                    let positionY = getRandomIntegerInInterval(bulle1.tailleY + 53, 100 - bulle1.tailleY);
                    bulle1.seDeplace(positionX, positionY);
                    this.tableauBulles.push(bulle1);
                }
                break;

            case 3:
                for (let i = 0; i < 3; i++) {
                    //let direction = Math.floor(Math.random() * (225 - 135)) + 135;
                    let direction = getRandomIntegerInInterval(135, 225);
                    var bulle1 = new BulleBleue(0, 0, direction);
                    // let positionX = Math.floor(Math.random() * (100 - 2 * bulle1.tailleX)) + bulle1.tailleX;
                    // let positionY = Math.floor(Math.random() * (100 - 2 * bulle1.tailleY - 53)) + bulle1.tailleY + 53;
                    let positionX = getRandomIntegerInInterval(bulle1.tailleX, 100 - bulle1.tailleX);
                    let positionY = getRandomIntegerInInterval(bulle1.tailleY + 53, 100 - bulle1.tailleY);
                    bulle1.seDeplace(positionX, positionY);
                    this.tableauBulles.push(bulle1);
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
}
//----------------------------------------------------------------------------------------------------------------------------------


function getRandomIntegerInInterval(min, max) {
    let r = Math.floor(Math.random() * (max - min)) + min;
    return r;
}



function modulo(number, modulo) {
    return ((number % modulo) + modulo) % modulo;
}