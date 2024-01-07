function getRandomIntegerInInterval(min, max) {
    let r = Math.floor(Math.random() * (max - min)) + min;
    return r;
}



function modulo(number, modulo) {
    return ((number % modulo) + modulo) % modulo;
}