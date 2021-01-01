var menu = document.getElementById("menu");
var navBar = document.getElementsByClassName("side-nav")[0];
var overlay = document.getElementsByClassName("overlay")[0];
var x = document.getElementById("x");

menu.addEventListener("click", function () {
    navBar.classList.toggle("side-nav-display");
    overlay.classList.toggle("on");
});

x.addEventListener("click", function () {
    navBar.classList.toggle("side-nav-display");
    overlay.classList.toggle("on");
});

overlay.addEventListener("click", function () {
    navBar.classList.toggle("side-nav-display");
    overlay.classList.toggle("on");
});
