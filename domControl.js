//-----------------------------------------------------------------------
//Event handling
//----------------------------------------------------------------------
window.onresize = displayALL;

//Array to keep a player's last movement event if another key is pressed
var keyDownRightLeft = { ArrowRight: false, ArrowLeft: false };
//the following eventListeners are used to manage the player's movement by continuously pressing an arrow key (left/right) 
//on the keyboard without interruption if another key on the keyboard is pressed (such as space to shoot)
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


// ---------------------------------------- 
// DOM CONTROL
// ----------------------------------------

function displayALL() {
    displayAllBubbles();
    displayAllArrows();
    displayAllObstacles();
    displayPlayer();
    updateLevelText();
    gameArea.style.backgroundImage = "url('backgrounds/" + game.level.backgroundImage + "')";
}

function displayAllMovingObjects() {
    displayPlayer();
    displayAllBubbles();
    displayAllArrows();
}

function displayAllBubbles() {
    for (buble of game.level.bubbles) {
        displayObject(buble);
    }
}

function displayAllArrows() {
    for (arrow of game.arrows) {
        displayObject(arrow);
    }
}


function displayAllObstacles() {
    for (obstacle of game.level.obstacles) {
        displayObject(obstacle);
    }
}

function displayPlayer() {
    displayObject(game.player);
}


function displayObject(GameObject) {
    // If the element exists, it is deleted from the DOM : :
    removeElementGameObjectFromDOM(GameObject)

    // Creation of the DOM element from the object :
    var elementGameObject = createDomElementGameObject(GameObject);

    // New element added to game area
    gameArea.insertBefore(elementGameObject, gameArea.firstChild);
}


function createDomElementGameObject(GameObject) {
    var elementGameObject = document.createElement("div");
    elementGameObject.id = GameObject.id;
    elementGameObject.setAttribute("class", GameObject.constructor.name);
    // object position :
    elementGameObject.style.left = GameObject.positionX + "%";
    elementGameObject.style.bottom = GameObject.positionY + "%";
    //calculating the ratio of height to width of the game area:      
    var ratio = gameArea.offsetWidth / gameArea.offsetHeight;
    // object size : 
    if (Bubble.prototype.isPrototypeOf(GameObject)) {
        // bubble speed according to ratio :
        GameObject.speedY = ratio * GameObject.speedX;

        var ratioBulle = GameObject.sizeY / GameObject.sizeX;

        if (ratio != ratioBulle) {
            // TO BE IMPROVED: THE AREA OF THE BUBBLE MUST REMAIN CONSTANT IN RELATION TO THE AREA OF THE PLAYING SURFACE---
            // adjust the width and height of the bubble so that it always appears round:      
            GameObject.setsizeX(GameObject.sizeX * (ratioBulle / ratio));
            elementGameObject.style.width = GameObject.sizeX + "%";
            elementGameObject.style.height = GameObject.sizeY + "%";
        } else {
            elementGameObject.style.width = GameObject.sizeX + "%";
            elementGameObject.style.height = GameObject.sizeY + "%";
        }
    }
    else if (Player.prototype.isPrototypeOf(GameObject)) {

        var playerRatio = GameObject.sizeY / GameObject.sizeX;
        //Player Div must allways appears square :
        if (playerRatio != ratio) {
            GameObject.setsizeX(GameObject.sizeX * (playerRatio / ratio));
        }

        elementGameObject.style.height = GameObject.sizeY + "%";
        elementGameObject.style.width = GameObject.sizeX + "%";
        //modify background image :
        if (keyDownRightLeft.ArrowLeft)
            elementGameObject.style.backgroundImage = "url('images/player_left.png')";
        else
            elementGameObject.style.backgroundImage = "url('images/player-right.png')";

        //Player opacity :
        elementGameObject.style.opacity = GameObject.opacity;
    }

    else if (Obstacle.prototype.isPrototypeOf(GameObject)) {
        GameObject.correctABWithRatio(ratio);
        elementGameObject.style.height = GameObject.sizeY + "%";
        let longueurCorrigee = Math.sqrt((GameObject.sizeX * Math.cos(modulo((GameObject.orientation - 90), 180) * 3.141592653589 / 180)) * (GameObject.sizeX * Math.cos(modulo((GameObject.orientation - 90), 180) * 3.141592653589 / 180)) + (1 / (ratio * ratio)) * (GameObject.sizeX * Math.sin(modulo((GameObject.orientation - 90), 180) * 3.141592653589 / 180)) * (GameObject.sizeX * Math.sin(modulo((GameObject.orientation - 90), 180) * 3.141592653589 / 180)));
        elementGameObject.style.width = longueurCorrigee + "%";

        //Rotate the div
        elementGameObject.style.transform = "rotate(" + modulo((GameObject.orientation - 90), 360) + "deg)";
        elementGameObject.style.transformOrigin = "4px 4px" // offset the centre of rotation to take into account the size of the border (2px)

        //obstacles color :
        elementGameObject.style.border = GameObject.color + " 4px solid";
        elementGameObject.style.outline = "thick double #32a1ce";
        //exception for game area borders : must not be displayed :
        if (GameObject.isAGameBorder == true) {
            elementGameObject.style.border = "0px";
            elementGameObject.style.outline = "0px";
        }

    } else if (Arrow.prototype.isPrototypeOf(GameObject)) {
        elementGameObject.style.bottom = game.player.sizeY + "%";
        elementGameObject.style.top = 100 - GameObject.positionY + "%"
        elementGameObject.style.width = GameObject.sizeX + "%";
    }
    return elementGameObject;
}

function removeElementGameObjectFromDOM(GameObject) {
    var elementExistant = document.getElementById(GameObject.id);
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