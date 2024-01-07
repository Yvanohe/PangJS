const TEXT_TIMEFINISH = "PERDU, TEMPS ECOULE !";
const TEXT_NOMORELIVES = "VOUS AVEZ PERDU ! VIES EPUISEES !";
const STARTING_LEVEL = 1;
const TEXT_GAMEFINISHED = "BRAVO VOUS AVEZ TERMINE LE JEU EN ";



var gameArea = document.getElementById("aireJeu");
var gamePaused = false;
var intervalDeplacementObjetsAutonomes;
var intervalDisplatAllObjects;
var intervalMovePlayer;
var levelTimer;
var globalTimer;
var totalTime = 0;
var timerOpacity;
var game;
var music = new Audio('./sons/music.mp3');
music.volume = 0.8;
music.loop = true;



//-----------------------------------------------------------------------
//Gestion des événements
window.onresize = displayALL;

//Tableau pour conserver l'event du déplacement d'un joueur si une autre touche est tapée
var keyDownRightLeft = { ArrowRight: false, ArrowLeft: false };
//les eventListeners suivant permettent de gérer le déplacement du joueur par appui continuel sur une touche fleche (gauche/droite) du clavier sans interruption si apui sur une autre touche du clavier (tel que l'espace pour tirer)
document.addEventListener("keydown", function (event) {
    if (event.key == 'ArrowRight') {
        keyDownRightLeft.ArrowRight = true;
    } else if (event.key == 'ArrowLeft') {
        keyDownRightLeft.ArrowLeft = true;;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key == 'ArrowRight') {
        keyDownRightLeft.ArrowRight = false;
    } else if (event.key == 'ArrowLeft') {
        keyDownRightLeft.ArrowLeft = false;
    }
});
document.addEventListener("keydown", joueurTire);


function startGame() {
    pauseGame();
    game = new Game(STARTING_LEVEL);
    removeGameElementsfromPlayArea();
    hideResults();
    game.startGame();
    displayALL();
    resetDOMPlayerLives();
    updateLevelText();
    updateDOMTimer();
    resumeGame();
    //music.play();

}

function pauseGame() {
    if (gamePaused == false) {
        gamePaused = true;
        clearInterval(levelTimer);
        clearInterval(intervalDeplacementObjetsAutonomes);
        clearInterval(intervalDisplatAllObjects);
        clearInterval(intervalMovePlayer);
        clearInterval(globalTimer);
        music.pause();

    }
}

function resumeGame() {
    if (gamePaused == true) {
        gamePaused = false;
        intervalDeplacementObjetsAutonomes = setInterval(deplacementObjetsAutonomes, 10);
        intervalDisplatAllObjects = setInterval(displayAllMovingObjects, 10);
        intervalMovePlayer = setInterval(deplacementJoueur, 20);
        startTimer();
        startGlobalTimer();
        music.play();
    }
}

function pauseOrResumeMusic() {

    if (music.paused) {
        music.play();
        changeAudioIcon(true);

    } else {
        music.pause();
        changeAudioIcon(false);
    }

}
//--------------------------------------------------------------------



// CONTROLE DU JEU-------------------------------------


function endRound() {
    if (game.player.pointDeVie == 0) {
        game.endGame();
        clearInterval(levelTimer);
        clearInterval(globalTimer);
        clearInterval(intervalDeplacementObjetsAutonomes);
        clearInterval(intervalDisplatAllObjects);
        clearInterval(intervalMovePlayer);
        music.pause();
        music.currentTime = 0;
    } else {
        if (game.level.levelnumber != 5) {
            removeGameElementsfromPlayArea();
            game.endGame();
            displayALL();
        } else {
            clearInterval(levelTimer);
            clearInterval(globalTimer);
            clearInterval(intervalDeplacementObjetsAutonomes);
            clearInterval(intervalDisplatAllObjects);
            clearInterval(intervalMovePlayer);
            showResults(TEXT_GAMEFINISHED + totalTime + "s !");
        }
    }
}

function startTimer() {
    levelTimer = setInterval(updateDOMTimer, 1000);

}

function startGlobalTimer() {
    globalTimer = setInterval(() => {
        totalTime += 1;
    }, (1000));
}

function resetOrEndTimer() {
    if (game.level.bubbles.length = !0) {
        game.player.pointDeVie = 0;
        endRound();
        showResults(TEXT_TIMEFINISH);
    } else {
        endRound();
        startTimer();
    }
}


function deplacementObjetsAutonomes() {
    for (bulle of game.level.bubbles) {
        var deltaY = bulle.vitesseY * Math.cos((bulle.direction / 360) * 2 * 3.14159);
        var deltaX = bulle.vitesseX * Math.sin((bulle.direction / 360) * 2 * 3.14159);

        bulle.seDeplace(deltaX, deltaY);
    }

    for (fleche of game.arrows) {
        if ((fleche.positionY + fleche.vitesse) <= 100) {
            fleche.seDeplace(0, fleche.vitesse);

        } else {
            detruireFleche(fleche);
        }

    }
    checkCollision();
}

function detruireFleche(fleche) {
    removeElementObjetJeuFromDOM(fleche);
    for (let i = 0; i < game.arrows.length; i++) {

        if (game.arrows[i].id == fleche.id) {
            game.arrows.splice(i, 1);
            break;
        }
    }
}

function deplacementJoueur() {

    var tailleJoueurEnPourcent = game.player.tailleX;

    if (keyDownRightLeft.ArrowRight) {
        var limiteDroite = 100 - tailleJoueurEnPourcent;
        if (game.player.positionX + game.player.vitesse <= limiteDroite) {
            game.player.seDeplace(game.player.vitesse, 0);
        } else {
            game.player.positionX = limiteDroite;
        }
    }

    if (keyDownRightLeft.ArrowLeft) {
        var limitegauche = 0;
        if (game.player.positionX - game.player.vitesse >= limitegauche) {
            game.player.seDeplace(-game.player.vitesse, 0);
        } else {
            game.player.positionX = limitegauche;
        }
    }
}


function joueurTire(event) {
    if (event.key == ' ') {
        for (fleche of game.arrows) {
            detruireFleche(fleche);
        }
        game.arrows.push(game.player.tire());
        let arrowSong = new Audio('./sons/arrow.mp3');
        arrowSong.volume = 0.5;
        arrowSong.play();
    }
}


function eclatementBulle(bulle) {
    removeElementObjetJeuFromDOM(bulle);
    sousBulles = bulle.eclate();
    let bubbleburst = new Audio('./sons/bubble.mp3');
    bubbleburst.play();
    if (sousBulles.length != 0) {
        game.level.bubbles.push(sousBulles[0]);
        game.level.bubbles.push(sousBulles[1]);
    }

    for (let i = 0; i < game.level.bubbles.length; i++) {
        if (game.level.bubbles[i].id == bulle.id) {
            game.level.bubbles.splice(i, 1);
            break;
        }
    }

    if (game.level.bubbles.length == 0) {
        endRound();
    }
    afficherToutesLesBulles();
}


function checkCollision() {
    // La collision de chaque bulle avec chaque objet (joueur, obstacles et fleches) est testée :
    for (bulle of game.level.bubbles) {
        //Collision avec Obstacle :   
        for (obstacle of game.level.obstacles) {
            if (isCollisionWithBubble(bulle, obstacle.positionX, obstacle.positionXend, obstacle.positionY, obstacle.positionY - obstacle.tailleX, obstacle.a, obstacle.b, obstacle.orientation)) {
                bulle.rebondi(obstacle.orientation);
            }
        }

        // Collision avec une fleche :
        for (fleche of game.arrows) {
            if (isCollisionWithBubble(bulle, fleche.positionX, fleche.positionX, fleche.positionY, 0, 0, 0, 0)) {
                detruireFleche(fleche);
                eclatementBulle(bulle);
            }
        }

        //collision avec le joueur :
        if (!game.player.invincible) {
            //Player left and right limits :
            if (isCollisionWithBubble(bulle, game.player.positionX, game.player.positionX, game.player.tailleY, 0, 0, game.player.tailleY, 0) || isCollisionWithBubble(bulle, game.player.positionX + game.player.tailleX, game.player.positionX + game.player.tailleX, game.player.tailleY, 0, 0, game.player.tailleY, 0)) {
                //bulle.rebondi(0);
                eclatementBulle(bulle);
                hurtPlayer(game.player);
                if (game.player.pointDeVie == 0) {
                    endRound();
                    showResults(TEXT_NOMORELIVES);
                }
            }
            //collision player upper limit :
            if (isCollisionWithBubble(bulle, game.player.positionX, game.player.positionX + game.player.tailleX, game.player.positionY, 0, 0, game.player.tailleY, 90)) {
                //bulle.rebondi(90);
                eclatementBulle(bulle);
                hurtPlayer(game.player);

                if (game.player.pointDeVie == 0) {
                    endRound();
                    showResults(TEXT_NOMORELIVES);
                }
            }
        }
    }

    //Collision between arrow and obstacle (destroying the arrow if collision) :
    for (obstacle of game.level.obstacles) {
        for (fleche of game.arrows) {
            if (!obstacle.bordure) {
                if ((fleche.positionY >= obstacle.a * fleche.positionX + obstacle.b - 0.5 && fleche.positionY <= obstacle.a * fleche.positionX + obstacle.b + 0.5) && (fleche.positionX >= obstacle.positionX && fleche.positionX < obstacle.positionXend)) {
                    detruireFleche(fleche);
                }
            }
        }
    }
}

function isCollisionWithBubble(bulle, obstaclePositionX, obstacleEndingX, obstaclePositionY, obstacleEndingY, obstacleSlopeA, obstacleOrigineB, obstacleOrientation) {
    //---------------------------------------------------------------------
    // Les bulles sont des ellipses dont les paramètres (ae et be) de l'équation sont connus
    // Les obstacles sont des droites d'équation y = ax+b (ou x = c pour le cas d'une droite verticale)
    // Système à 2 équations :
    // ellispe : (x-xc)²/(ae)² +(y-yc)²/(be)² = 1
    // droite : y=ax + b
    // par substitution équation du second degré :
    // X²(be² + ae²a²) + X(2ae²ab - 2aae²yc - 2xcbe²) + (xc²be² +ae²b² -2ae²byc + ae²yc² - ae²be²) = 0
    // Soit le discriminant :
    // delta = B² - 4AC = (2ae²ab - 2aae²yc - 2xcbe²)² - 4(be² +ae²a²)(xc²be² + ae²b²-2ae²byc+ae²yc²+ae²yc²-ae²be²)
    // si delta >= 0 alors une ou plusieurs solution => intersection de la bulle avec une limite donc rebondissement
    // les limites ne sont pas des droites mais des segments donc vérification que les points sont dans les limites du segments
    // cas spécial ou la droite est VERTICALE donc d'équation x = positionX (Px)
    // ae²Y² -2ae²ycY + be²Px² - 2Pxxcbe²+xc²be² + ae²yc²-ae²be² = 0
    // delta = (2ae²yc)² -4ae²(be²Px²-2Pxxcbe²+xc²be²+ae²yc²-ae²be²)
    //-------------------------------------------------------------------------


    // Non vertical obstacle :
    if (obstacleOrientation != 0 && obstacleOrientation != 180) {
        //second-degree equation parameters :
        A = bulle.be * bulle.be + bulle.ae * bulle.ae * obstacleSlopeA * obstacleSlopeA;
        B = 2 * bulle.ae * bulle.ae * obstacleSlopeA * obstacleOrigineB - 2 * obstacleSlopeA * bulle.ae * bulle.ae * bulle.yc - 2 * bulle.xc * bulle.be * bulle.be;
        C = bulle.xc * bulle.xc * bulle.be * bulle.be + bulle.ae * bulle.ae * obstacleOrigineB * obstacleOrigineB - 2 * bulle.ae * bulle.ae * obstacleOrigineB * bulle.yc + bulle.ae * bulle.ae * bulle.yc * bulle.yc - bulle.ae * bulle.ae * bulle.be * bulle.be;
        delta = B * B - 4 * A * C;

        if (delta >= 0) {
            // Verification que les coordonnées du point   d'impact sont bien compris dans les limites du segment de l'obstacle (jusqu'ici considéré comme une droite)
            //solutions:
            let x1 = (-B - Math.sqrt(delta)) / (2 * A);
            let x2 = (-B + Math.sqrt(delta)) / (2 * A);


            //if ((x1 >= obstacle.positionX && x1 <= (obstacle.positionX + obstacle.tailleX)) || (x2 >= obstacle.positionX && x2 <= (obstacle.positionX + obstacle.tailleX))) {
            if ((x1 >= obstaclePositionX && x1 <= (obstacleEndingX)) || (x2 >= obstaclePositionX && x2 <= (obstacleEndingX))) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    else {// vertical obstacle (orientation = 0 OR 180)

        A = bulle.ae * bulle.ae
        B = -2 * bulle.ae * bulle.ae * bulle.yc;
        C = bulle.be * bulle.be * obstaclePositionX * obstaclePositionX - 2 * obstaclePositionX * bulle.xc * bulle.be * bulle.be + bulle.xc * bulle.xc * bulle.be * bulle.be + bulle.ae * bulle.ae * bulle.yc * bulle.yc - bulle.ae * bulle.ae * bulle.be * bulle.be;
        delta = B * B - 4 * A * C;

        if (delta >= 0) {
            // Verification que les coordonnées du point d'impact sont bien compris dans les limites du segment de l'obstacle (jusqu'ici considéré comme une droite)
            //solutions:
            let y1 = (-B - Math.sqrt(delta)) / (2 * A);
            let y2 = (-B + Math.sqrt(delta)) / (2 * A);

            if (y1 < obstaclePositionY && y1 > obstacleEndingY || y2 < obstaclePositionY && y2 > obstacleEndingY) {

                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}

function hurtPlayer(player) {

    player.estBlesse();
    if (!player.invincible) {
        //play song
        let cri = new Audio('./sons/hurt.mp3');
        cri.play();

        hidePlayerLives();
        player.makePlayerInvincible();
        timerOpacity = setInterval(() => changePlayerOpacity(player), 200);
        setTimeout(() => cancelPlayerinvincibility(player), 2000);
    }

}

function changePlayerOpacity(player) {
    if (player.opacity == 1)
        player.makePlayerTransparent();
    else
        player.makePlayerOpaque();
}

function cancelPlayerinvincibility(player) {
    player.cancelPlayerinvincibility();
    clearInterval(timerOpacity);
}
