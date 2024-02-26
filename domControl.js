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
        keyDownRightLeft.ArrowLeft = true;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key == 'ArrowRight') {
        keyDownRightLeft.ArrowRight = false;
    } else if (event.key == 'ArrowLeft') {
        keyDownRightLeft.ArrowLeft = false;
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key == ' ') {
        joueurTire();
    }
});

function mouseDown(direction) {
    if (direction == "left") {
        keyDownRightLeft.ArrowLeft = true;
    } else if (direction == "right") {
        keyDownRightLeft.ArrowRight = true;
    }
}

function mouseUp(direction) {
    if (direction == "left") {
        keyDownRightLeft.ArrowLeft = false;
    } else if (direction == "right") {
        keyDownRightLeft.ArrowRight = false;
    }
}

// event for use on mobile phone: 
document.getElementById("leftButton").addEventListener("touchstart", function () {
    keyDownRightLeft.ArrowLeft = true;
});

document.getElementById("leftButton").addEventListener("touchend", function () {
    keyDownRightLeft.ArrowLeft = false;
});
document.getElementById("rightButton").addEventListener("touchstart", function () {
    keyDownRightLeft.ArrowRight = true;
});

document.getElementById("rightButton").addEventListener("touchend", function () {
    keyDownRightLeft.ArrowRight = false;
});

// MANIPULATION DU DOM -----------------------------------------------------------------------------------------
function displayALL() {
    afficherToutesLesBulles();
    afficherToutesLesFleches();
    afficherObstacles();
    afficherJoueur();
    updateLevelText();
    gameArea.style.backgroundImage = "url('backgrounds/" + game.level.backgroundImage + "')";
}

function displayAllMovingObjects() {
    afficherJoueur();
    afficherToutesLesBulles();
    afficherToutesLesFleches();
}

function afficherToutesLesBulles() {
    for (buble of game.level.bubbles) {
        afficherObjet(buble);
    }
}

function afficherToutesLesFleches() {
    for (fleche of game.arrows) {
        afficherObjet(fleche);
    }
}


function afficherObstacles() {
    for (obstacle of game.level.obstacles) {
        afficherObjet(obstacle);
    }
}

function afficherJoueur() {
    afficherObjet(game.player);
}


function afficherObjet(objetJeu) {
    // Si l'élément existe on le supprime du DOM :
    removeElementObjetJeuFromDOM(objetJeu)

    // Création de l'élément du DOM à partir de l'objet :
    var elementObjetJeu = creerDomElementObjeJeu(objetJeu);
    // Vérification si un élément du DOM avec le même id existe déjà :

    // A jout du nouvel élément à "l'aire de jeu"
    gameArea.insertBefore(elementObjetJeu, gameArea.firstChild);
}


function creerDomElementObjeJeu(objetJeu) {
    var elementObjetJeu = document.createElement("div");
    elementObjetJeu.id = objetJeu.id;
    elementObjetJeu.setAttribute("class", objetJeu.constructor.name);
    // position de l'objet :
    elementObjetJeu.style.left = objetJeu.positionX + "%";
    elementObjetJeu.style.bottom = objetJeu.positionY + "%";
    //calcul ratio hauteur / largeur aire de jeu :      
    var ratio = gameArea.offsetWidth / gameArea.offsetHeight;
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

        //Player opacity :
        elementObjetJeu.style.opacity = objetJeu.opacity;
    }

    else if (Obstacle.prototype.isPrototypeOf(objetJeu)) {
        objetJeu.correctABWithRatio(ratio);
        elementObjetJeu.style.height = objetJeu.tailleY + "%";
        let longueurCorrigee = Math.sqrt((objetJeu.tailleX * Math.cos(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) * (objetJeu.tailleX * Math.cos(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) + (1 / (ratio * ratio)) * (objetJeu.tailleX * Math.sin(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)) * (objetJeu.tailleX * Math.sin(modulo((objetJeu.orientation - 90), 180) * 3.141592653589 / 180)));
        elementObjetJeu.style.width = longueurCorrigee + "%";

        //Rotate the div
        elementObjetJeu.style.transform = "rotate(" + modulo((objetJeu.orientation - 90), 360) + "deg)";
        //elementObjetJeu.style.transform = "rotate(" + modulo((objetJeu.orientation - 90), 180) + "deg)";
        elementObjetJeu.style.transformOrigin = "4px 4px" // décalage du centre de rotation pour prendre en compte la taille de la border (2px)

        //couleur de la border :
        elementObjetJeu.style.border = objetJeu.couleur + " 4px solid";
        elementObjetJeu.style.outline = "thick double #32a1ce";
        //exception pour les bordures du jeu : on ne les affiches pas :
        if (objetJeu.bordure == true) {
            elementObjetJeu.style.border = "0px";
            elementObjetJeu.style.outline = "0px";
        }


    } else if (Fleche.prototype.isPrototypeOf(objetJeu)) {
        elementObjetJeu.style.bottom = game.player.tailleY + "%";

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
    var element = gameArea.firstElementChild;

    while (element != null && element.id != "divTextResult") {
        element.remove();
        element = gameArea.firstElementChild;
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
    while (element != null) {
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
    elementTimer.innerText = Math.floor(game.level.time / 1000) + " s";
    game.level.time = game.level.time - 1000;
    if (game.level.time < 0) {
        resetOrEndTimer();
    } else if (game.level.time < 10 * 1000) {
        elementTimer.style.color = "red";
    } else { elementTimer.style.color = "white"; }
}

function updateLevelText() {
    if (game.level.levelnumber != 6) {
        document.getElementById("level").innerText = "Level " + game.level.levelnumber + " / 5";
    } else {
        document.getElementById("level").innerText = "You win !";

    }

}

function changeAudioIcon(state) {
    let audioIcon = document.getElementById("musicIcon");
    if (state) {
        audioIcon.src = "images/haut-parleur-audio-active.png";
    } else {
        audioIcon.src = "images/haut-parleur-audio-nonActive.png";
    }
}