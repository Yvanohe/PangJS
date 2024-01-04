var aireDeJeu = document.getElementById("aireJeu");
var gamePaused = false;
var intervalDeplacementObjetsAutonomes;
var intervalDisplatAllObjects;
var intervalMovePlayer;
var timer;
var partie;
//startTimer();



//-----------------------------------------------------------------------
//Gestion des événements
window.onresize = displayALL;

//Tableau pour conserver l'event du déplacement d'un joueur si une autre touche est tapée
var keyDownRightLeft = { ArrowRight: false, ArrowLeft: false };
//les eventListeners suivant permettent de gérer le déplacement du joueur par appui continuel sur une touche fleche (gauche/droite) du clavier sans interruption si apui sur une autre touche du clavier (tel que l'espace pour tirer)
document.addEventListener("keydown", function (event) {
    if (event.key == 'ArrowRight') {
        console.log("ARROWRIGHT : " + event.key);
        keyDownRightLeft.ArrowRight = true;
    } else if (event.key == 'ArrowLeft') {
        console.log("ARROWLEFT : " + event.key);
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
    partie = new Partie(1);
    removeGameElementsfromPlayArea();
    hideResults();
    partie.commencerPartie();
    displayALL();
    resetDOMPlayerLives();
    updateLevelText();
    updateDOMTimer();
    resumeGame();

}

function pauseGame() {
    if (gamePaused == false) {
        gamePaused = true;
        clearInterval(timer);
        clearInterval(intervalDeplacementObjetsAutonomes);
        clearInterval(intervalDisplatAllObjects);
        clearInterval(intervalMovePlayer);

    }
}

function resumeGame() {
    if (gamePaused == true) {
        gamePaused = false;
        intervalDeplacementObjetsAutonomes = setInterval(deplacementObjetsAutonomes, 10);
        intervalDisplatAllObjects = setInterval(displayAllMovingObjects, 10);
        intervalMovePlayer = setInterval(deplacementJoueur, 20);
        startTimer();
    }
}
//--------------------------------------------------------------------



// CONTROLE DU JEU-------------------------------------


function endRound() {
    if (partie.joueur.pointDeVie == 0) {
        partie.terminerPartie();
        clearInterval(timer);
        clearInterval(intervalDeplacementObjetsAutonomes);
        clearInterval(intervalDisplatAllObjects);
        clearInterval(intervalMovePlayer);
    } else {
        removeGameElementsfromPlayArea();
        partie.terminerPartie();
        displayALL();
    }
}

function startTimer() {
    timer = setInterval(updateDOMTimer, 1000);

}

function resetOrEndTimer() {
    if (partie.niveau.tableauBulles.length = !0) {
        partie.joueur.pointDeVie = 0;
        endRound();
        showResults("PERDU, TEMPS ECOULE !")
    } else {
        endRound();
        startTimer();
    }
}


function deplacementObjetsAutonomes() {
    for (bulle of partie.niveau.tableauBulles) {
        var deltaY = bulle.vitesseY * Math.cos((bulle.direction / 360) * 2 * 3.14159);
        var deltaX = bulle.vitesseX * Math.sin((bulle.direction / 360) * 2 * 3.14159);

        bulle.seDeplace(deltaX, deltaY);
    }

    for (fleche of partie.tableauFleche) {
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
    for (let i = 0; i < partie.tableauFleche.length; i++) {

        if (partie.tableauFleche[i].id == fleche.id) {
            partie.tableauFleche.splice(i, 1);
            break;
        }
    }
}

function deplacementJoueur() {

    var tailleJoueurEnPourcent = partie.joueur.tailleX;

    if (keyDownRightLeft.ArrowRight) {
        var limiteDroite = 100 - tailleJoueurEnPourcent;
        if (partie.joueur.positionX + partie.joueur.vitesse <= limiteDroite) {
            partie.joueur.seDeplace(partie.joueur.vitesse, 0);
        } else {
            partie.joueur.positionX = limiteDroite;
        }
    }

    if (keyDownRightLeft.ArrowLeft) {
        var limitegauche = 0;
        if (partie.joueur.positionX - partie.joueur.vitesse >= limitegauche) {
            partie.joueur.seDeplace(-partie.joueur.vitesse, 0);
        } else {
            partie.joueur.positionX = limitegauche;
        }
    }
}


function joueurTire(event) {
    if (event.key == ' ') {
        for (fleche of partie.tableauFleche) {
            detruireFleche(fleche);
        }
        partie.tableauFleche.push(partie.joueur.tire());
    }
}


function eclatementBulle(bulle) {
    removeElementObjetJeuFromDOM(bulle);
    sousBulles = bulle.eclate();
    if (sousBulles.length != 0) {
        partie.niveau.tableauBulles.push(sousBulles[0]);
        partie.niveau.tableauBulles.push(sousBulles[1]);
    }

    for (let i = 0; i < partie.niveau.tableauBulles.length; i++) {
        if (partie.niveau.tableauBulles[i].id == bulle.id) {
            partie.niveau.tableauBulles.splice(i, 1);
            break;
        }
    }

    if (partie.niveau.tableauBulles.length == 0) {
        endRound();
    }
    afficherToutesLesBulles();
}


function checkCollision() {
    // La collision de chaque bulle avec chaque objet (joueur, obstacles et fleches) est testée :
    for (bulle of partie.niveau.tableauBulles) {
        //Collision avec Obstacle :   
        for (obstacle of partie.niveau.tableauObstacles) {
            if (isCollisionWithBubble(bulle, obstacle.positionX, obstacle.positionXend, obstacle.positionY, obstacle.positionY - obstacle.tailleX, obstacle.a, obstacle.b, obstacle.orientation)) {
                bulle.rebondi(obstacle.orientation);
            }
        }

        // Collision avec une fleche :
        for (fleche of partie.tableauFleche) {
            if (isCollisionWithBubble(bulle, fleche.positionX, fleche.positionX, fleche.positionY, 0, 0, 0, 0)) {
                detruireFleche(fleche);
                eclatementBulle(bulle);
            }
        }

        //collision avec le joueur :
        //Player left and right limits :
        if (isCollisionWithBubble(bulle, partie.joueur.positionX, partie.joueur.positionX, partie.joueur.tailleY, 0, 0, partie.joueur.tailleY, 0) || isCollisionWithBubble(bulle, partie.joueur.positionX + partie.joueur.tailleX, partie.joueur.positionX + partie.joueur.tailleX, partie.joueur.tailleY, 0, 0, partie.joueur.tailleY, 0)) {
            bulle.rebondi(0);
            partie.joueur.estBlesse();
            hidePlayerLives();
            if (partie.joueur.pointDeVie == 0) {
                endRound();
                showResults("VOUS AVEZ PERDU ! VIES EPUISEES !")
            }
        }
        //collision player upper limit :
        if (isCollisionWithBubble(bulle, partie.joueur.positionX, partie.joueur.positionX + partie.joueur.tailleX, partie.joueur.positionY, 0, 0, partie.joueur.tailleY, 90)) {
            bulle.rebondi(90);
            partie.joueur.estBlesse();
            hidePlayerLives();

            if (partie.joueur.pointDeVie == 0) {
                endRound();
                showResults("VOUS AVEZ PERDU ! VIES EPUISEES !")
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
    }
}

// MANIPULATION DU DOM -----------------------------------------------------------------------------------------
function displayALL() {
    afficherToutesLesBulles();
    afficherToutesLesFleches();
    afficherObstacles();
    afficherJoueur();
    updateLevelText();
    aireDeJeu.style.backgroundImage = "url('backgrounds/" + partie.niveau.backgroundImage + "')";
}

function displayAllMovingObjects() {
    afficherJoueur();
    afficherToutesLesBulles();
    afficherToutesLesFleches();
}

function afficherToutesLesBulles() {
    for (bulle of partie.niveau.tableauBulles) {
        afficherObjet(bulle);
    }
}

function afficherToutesLesFleches() {
    for (fleche of partie.tableauFleche) {
        afficherObjet(fleche);
    }
}


function afficherObstacles() {
    for (obstacle of partie.niveau.tableauObstacles) {
        afficherObjet(obstacle);
    }
}

function afficherJoueur() {
    afficherObjet(partie.joueur);
}


function afficherObjet(objetJeu) {
    // Si l'élément existe on le supprime du DOM :
    removeElementObjetJeuFromDOM(objetJeu)

    // Création de l'élément du DOM à partir de l'objet :
    var elementObjetJeu = creerDomElementObjeJeu(objetJeu);
    // Vérification si un élément du DOM avec le même id existe déjà :

    // A jout du nouvel élément à "l'aire de jeu"
    aireDeJeu.insertBefore(elementObjetJeu, aireDeJeu.firstChild);
}


function creerDomElementObjeJeu(objetJeu) {
    var elementObjetJeu = document.createElement("div");
    elementObjetJeu.id = objetJeu.id;
    elementObjetJeu.setAttribute("class", objetJeu.constructor.name);
    // position de l'objet :
    elementObjetJeu.style.left = objetJeu.positionX + "%";
    elementObjetJeu.style.bottom = objetJeu.positionY + "%";
    //calcul ratio hauteur / largeur aire de jeu :      
    var ratio = aireDeJeu.offsetWidth / aireDeJeu.offsetHeight;
    // taille de j'objet : 
    if (Bulle.prototype.isPrototypeOf(objetJeu)) {

        // vitesse de la bulle selon ratio :
        objetJeu.vitesseY = ratio * objetJeu.vitesseX;

        var ratioBulle = objetJeu.tailleY / objetJeu.tailleX;

        if (ratio != ratioBulle) { // A AMELIORER : C'EST L'AIRE DE LA BULLE QUI DOIT RESTER CONSTANTE PAR RAPPORT A L'AIRE DE LA SURFACE DE JEU
            // ajsutement width et height de la bulle pour qu'elle paraisse toujours ronde
            // il faut modifier les caractéristiques de taille de la bulle pour qu'elles soient cohérentes avec la vue:

            objetJeu.setTailleX(objetJeu.tailleX * (ratioBulle / ratio));
            elementObjetJeu.style.width = objetJeu.tailleX + "%";

            elementObjetJeu.style.height = objetJeu.tailleY + "%";

        } else {
            elementObjetJeu.style.width = objetJeu.tailleX + "%";
            elementObjetJeu.style.height = objetJeu.tailleY + "%";
        }
    }
    else if (Joueur.prototype.isPrototypeOf(objetJeu)) {

        var ratioJoueur = objetJeu.tailleY / objetJeu.tailleX;
        //Player Div must allways appears square :
        if (ratioJoueur != ratio) {
            objetJeu.setTailleX(objetJeu.tailleX * (ratioJoueur / ratio));
        }

        elementObjetJeu.style.height = objetJeu.tailleY + "%";
        elementObjetJeu.style.width = objetJeu.tailleX + "%";
        //modify background image :
        if (keyDownRightLeft.ArrowLeft)
            elementObjetJeu.style.backgroundImage = "url('images/player_left.png')";
        else
            elementObjetJeu.style.backgroundImage = "url('images/player-right.png')";
    }

    else if (Obstacle.prototype.isPrototypeOf(objetJeu)) {
        objetJeu.correctABWithRatio(ratio);
        elementObjetJeu.style.height = objetJeu.tailleY + "%";
        let longueurCorrigee = Math.sqrt((objetJeu.tailleX * Math.cos(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) * (objetJeu.tailleX * Math.cos(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) + (1 / (ratio * ratio)) * (objetJeu.tailleX * Math.sin(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) * (objetJeu.tailleX * Math.sin(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)));
        elementObjetJeu.style.width = longueurCorrigee + "%";
        //Détermination des coordonnées finales du segment :
        let A = 1 + objetJeu.a * objetJeu.a;
        let B = objetJeu.positionX * (-2 - 2 * objetJeu.a * objetJeu.a);
        let C = objetJeu.positionX * objetJeu.positionX * (1 + objetJeu.a * objetJeu.a) - objetJeu.tailleX * objetJeu.tailleX;
        let delta = B * B - 4 * A * C;
        let x11 = (-B - Math.sqrt(delta)) / (2 * A);
        let x12 = (-B + Math.sqrt(delta)) / (2 * A);
        console.log("longeur corrigée : " + longueurCorrigee)
        console.log("X11 : " + x11);
        console.log("X12 : " + x12);

        let x1 = Math.max(x11, x12);
        let y1 = objetJeu.a * x1 + objetJeu.b
        objetJeu.positionXend = x1;
        objetJeu.positionYend = y1;

        elementObjetJeu.style.transform = "rotate(" + modulo((objetJeu.orientation - 90), 180) + "deg)";
        elementObjetJeu.style.transformOrigin = "4px 4px" // décalage du centre de rotation pour prendre en compte la taille de la border (2px)

        //couleur de la border :
        elementObjetJeu.style.border = objetJeu.couleur + " 4px solid";
        elementObjetJeu.style.outline = "thick double #32a1ce";
        //exception pour les bordures du jeu : on ne les affiches pas :
        if (objetJeu.bordure == true) {
            console.log("MODIFICATION BORDURE");
            elementObjetJeu.style.border = "0px";
            elementObjetJeu.style.outline = "0px";
        }


    } else if (Fleche.prototype.isPrototypeOf(objetJeu)) {
        elementObjetJeu.style.bottom = partie.joueur.tailleY + "%";

        elementObjetJeu.style.top = 100 - objetJeu.positionY + "%"
        // elementObjetJeu.style.height = objetJeu.tailleY + "%";
        elementObjetJeu.style.width = objetJeu.tailleX + "%";

    }
    return elementObjetJeu;
}

function removeElementObjetJeuFromDOM(objetJeu) {
    var elementExistant = document.getElementById(objetJeu.id);
    if (elementExistant != null) {
        elementExistant.remove();
    }
}

function removeGameElementsfromPlayArea() {
    var element = aireDeJeu.firstElementChild;

    while (element != null && element.id != "divTextResult") {
        element.remove();
        element = aireDeJeu.firstElementChild;
    }

}

function hidePlayerLives() {
    var divPlayerLives = document.getElementById("coeur");

    element = divPlayerLives.lastElementChild;
    while (element.style.visibility == "hidden") {
        element = element.previousElementSibling;
    }
    element.style.visibility = "hidden";
    element.style.transform = "rotate(360deg)";
    element.style.width = "5%";
}


function resetDOMPlayerLives() {
    var divPlayerLives = document.getElementById("coeur");
    var element = divPlayerLives.lastElementChild;
    console.log(element);
    while (element != null) {
        console.log("RESET COEUR");
        element.style.visibility = "visible";
        element.style.width = "100%";
        element = element.previousElementSibling;
    }

}

function showResults(text) {
    let element = document.getElementById("divTextResult");
    element.style.visibility = "visible";
    let ptext = document.getElementById("textresult");
    ptext.innerHTML = text;



}

function hideResults() {
    let element = document.getElementById("divTextResult");
    element.style.visibility = "hidden";
}

function updateDOMTimer() {
    var elementTimer = document.getElementById("timer");
    elementTimer.innerText = Math.floor(partie.niveau.time / 1000) + " s";
    partie.niveau.time = partie.niveau.time - 1000;
    if (partie.niveau.time < 0) {
        resetOrEndTimer();
    } else if (partie.niveau.time < 10 * 1000) {
        elementTimer.style.color = "red";
    } else { elementTimer.style.color = "white"; }
}

function updateLevelText() {
    document.getElementById("level").innerText = "Niveau " + partie.niveau.level;
}






