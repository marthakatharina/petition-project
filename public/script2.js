var menuOpen = document.getElementById("menu");
var navBar = document.getElementsByClassName("side-nav")[0];
var overlay = document.getElementsByClassName("overlay")[0];
var xClose = document.getElementById("x");

menuOpen.addEventListener("click", function () {
    navBar.classList.remove("off");
    navBar.classList.toggle("side-nav-display");
    overlay.classList.toggle("on");
});

xClose.addEventListener("click", function () {
    navBar.classList.toggle("side-nav-display");
    navBar.classList.add("off");
    overlay.classList.toggle("on");
});

overlay.addEventListener("click", function () {
    navBar.classList.toggle("side-nav-display");
    overlay.classList.toggle("on");
});
