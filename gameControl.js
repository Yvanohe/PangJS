const TEXT_TIMEFINISH = "GAME OVER, TEMPS ECOULE !";
const TEXT_NOMORELIVES = "GAME OVER, NO MORE LIVES !";
const TEXT_GAMEFINISHED = "CONGRATULATIONS YOU FINISHED THE GAME IN ";

//------------------------------ 
// INITIALIZATION
//-----------------------------
const STARTING_LEVEL = 1;
const LAST_LEVEL = 6;
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



//----------------------
// Controle of the on going game's state
//----------------------
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



// ------------------- 
// GAME CONTROL
//--------------------

function endRound() {
    if (game.player.lives == 0) {
        game.endGame();
        clearInterval(levelTimer);
        clearInterval(globalTimer);
        clearInterval(intervalDeplacementObjetsAutonomes);
        clearInterval(intervalDisplatAllObjects);
        clearInterval(intervalMovePlayer);
        music.pause();
        music.currentTime = 0;
    } else {
        removeGameElementsfromPlayArea();
        game.endGame();
        if (game.level.levelnumber == LAST_LEVEL) { // Game finished
            removeGameElementsfromPlayArea();
            clearInterval(levelTimer);
            clearInterval(globalTimer);
            clearInterval(intervalDeplacementObjetsAutonomes);
            clearInterval(intervalDisplatAllObjects);
            clearInterval(intervalMovePlayer);
            showResults(TEXT_GAMEFINISHED + totalTime + "s !");
        } else {
            displayALL();
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
        game.player.lives = 0;
        endRound();
        showResults(TEXT_TIMEFINISH);
    } else {
        endRound();
        startTimer();
    }
}


function deplacementObjetsAutonomes() {
    for (bulle of game.level.bubbles) {
        var deltaY = bulle.speedY * Math.cos((bulle.direction / 360) * 2 * 3.14159);
        var deltaX = bulle.speedX * Math.sin((bulle.direction / 360) * 2 * 3.14159);

        bulle.seDeplace(deltaX, deltaY);
    }

    for (arrow of game.arrows) {
        if ((arrow.positionY + arrow.speed) <= 100) {
            arrow.seDeplace(0, arrow.speed);

        } else {
            destroyArrow(arrow);
        }

    }
    checkCollision();
}

function destroyArrow(arrow) {
    removeElementGameObjectFromDOM(arrow);
    for (let i = 0; i < game.arrows.length; i++) {

        if (game.arrows[i].id == arrow.id) {
            game.arrows.splice(i, 1);
            break;
        }
    }
}

function deplacementJoueur() {

    var tailleJoueurEnPourcent = game.player.sizeX;

    if (keyDownRightLeft.ArrowRight) {
        var limiteDroite = 100 - tailleJoueurEnPourcent;
        if (game.player.positionX + game.player.speed <= limiteDroite) {
            game.player.seDeplace(game.player.speed, 0);
        } else {
            game.player.positionX = limiteDroite;
        }
    }

    if (keyDownRightLeft.ArrowLeft) {
        var limitegauche = 0;
        if (game.player.positionX - game.player.speed >= limitegauche) {
            game.player.seDeplace(-game.player.speed, 0);
        } else {
            game.player.positionX = limitegauche;
        }
    }
}


function joueurTire() {
    for (arrow of game.arrows) {
        destroyArrow(arrow);
    }
    game.arrows.push(game.player.shoot());
    let arrowSong = new Audio('./sons/arrow.mp3');
    arrowSong.volume = 0.5;
    arrowSong.play();
}



function eclatementBulle(bulle) {
    removeElementGameObjectFromDOM(bulle);
    sousBulles = bulle.burst();
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
    displayAllBubbles();
}


function checkCollision() {
    // La collision de chaque bulle avec chaque objet (joueur, obstacles et fleches) est testée :
    for (bulle of game.level.bubbles) {
        //Collision avec Obstacle :   
        for (obstacle of game.level.obstacles) {
            if (isCollisionWithBubble(bulle, obstacle.positionX, obstacle.positionXend, obstacle.positionY, obstacle.positionY - obstacle.sizeX, obstacle.a, obstacle.b, obstacle.orientation)) {
                makeBubbleBounce(bulle, obstacle.orientation);
                //bulle.rebondi(obstacle.orientation);
            }
        }

        // Collision avec une fleche :
        for (arrow of game.arrows) {
            if (isCollisionWithBubble(bulle, arrow.positionX, arrow.positionX, arrow.positionY, 0, 0, 0, 0)) {
                destroyArrow(arrow);
                eclatementBulle(bulle);
            }
        }

        //collision avec le joueur :
        if (!game.player.invincible) {
            //Player left and right limits :
            if (isCollisionWithBubble(bulle, game.player.positionX, game.player.positionX, game.player.sizeY, 0, 0, game.player.sizeY, 0) || isCollisionWithBubble(bulle, game.player.positionX + game.player.sizeX, game.player.positionX + game.player.sizeX, game.player.sizeY, 0, 0, game.player.sizeY, 0)) {
                eclatementBulle(bulle);
                hurtPlayer(game.player);
                if (game.player.lives == 0) {
                    endRound();
                    showResults(TEXT_NOMORELIVES);
                }
            }
            //collision player upper limit :
            if (isCollisionWithBubble(bulle, game.player.positionX, game.player.positionX + game.player.sizeX, game.player.positionY, 0, 0, game.player.sizeY, 90)) {
                eclatementBulle(bulle);
                hurtPlayer(game.player);

                if (game.player.lives == 0) {
                    endRound();
                    showResults(TEXT_NOMORELIVES);
                }
            }
        }
    }

    //Collision between arrow and obstacle (destroying the arrow if collision) :
    for (obstacle of game.level.obstacles) {
        for (ArrowRight of game.arrows) {
            if (!obstacle.isAGameBorder) {
                if ((ArrowRight.positionY >= obstacle.a * ArrowRight.positionX + obstacle.b - 0.5 && ArrowRight.positionY <= obstacle.a * ArrowRight.positionX + obstacle.b + 0.5) && (arrow.positionX >= obstacle.positionX && arrow.positionX < obstacle.positionXend)) {
                    destroyArrow(arrow);
                }
            }
        }
    }
}

function isCollisionWithBubble(bulle, obstaclePositionX, obstacleEndingX, obstaclePositionY, obstacleEndingY, obstacleSlopeA, obstacleOrigineB, obstacleOrientation) {
    //---------------------------------------------------------------------
    // The bubbles are ellipses whose parameters (ae and be) in the equation are known
    // Obstacles are straight lines with equation y = ax+b (or x = c for a vertical line).
    // 2 equations system :
    // ellispe : (x-xc)²/(ae)² +(y-yc)²/(be)² = 1
    // lines : y=ax + b
    // by substitution;  second-degree equation :
    // X²(be² + ae²a²) + X(2ae²ab - 2aae²yc - 2xcbe²) + (xc²be² +ae²b² -2ae²byc + ae²yc² - ae²be²) = 0
    // the discriminant is  :
    // delta = B² - 4AC = (2ae²ab - 2aae²yc - 2xcbe²)² - 4(be² +ae²a²)(xc²be² + ae²b²-2ae²byc+ae²yc²+ae²yc²-ae²be²)
    // if delta >= 0 then one or more solutions => the bubble intersects a limit, so it bounces back
    // the limits are not straight lines but segments, so check that the points are within the limits of the segment
    // special case where the straight line is vetical, i.e. of equation x = positionX (Px)
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
            // Check that the coordinates of the point of impact are well within the limits of the segment of the obstacle ( so far considered as a straight line).
            // 2 solutions:
            let x1 = (-B - Math.sqrt(delta)) / (2 * A);
            let x2 = (-B + Math.sqrt(delta)) / (2 * A);

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
            // Check that the coordinates of the point of impact are well within the limits of the segment of the obstacle (hitherto considered to be a straight line).
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
    player.hurt();
    if (!player.invincible) {
        //play song
        let cri = new Audio('./sons/hurt.mp3');
        cri.play();

        hidePlayerLives();
        // when hit, player becomes invinble during 2s.
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

function makeBubbleBounce(bubble, orientation) {
    if (bubble.canBounceback) {
        bubble.bounce(orientation);
        // To reduce bubble to be "catch" by an edge, bubble cannot bounce back during 150ms
        bubble.disableBubbleBouncy();
        setTimeout(() => bubble.makeBubbleBouncy(), 150);
    }
}


