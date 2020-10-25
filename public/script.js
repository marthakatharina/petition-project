const canvasJQ = $("canvas");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// var context = document.getElementById("canvas").getContext("2d");

const signature = $('input[name="signature"]');

// Canvas drawing:
canvasJQ.on("mousedown", (e) => {
    let x = e.clientX - canvasJQ.eq(0).offset().left;
    let y = e.clientY - canvasJQ.eq(0).offset().top;
    context.moveTo(x, y);
    context.beginPath();
    canvasJQ.on("mousemove", (e) => {
        let x = e.clientX - canvasJQ.eq(0).offset().left;
        let y = e.clientY - canvasJQ.eq(0).offset().top;
        context.lineTo(x, y);
        context.stroke();
    });
    canvasJQ.on("mouseup", () => {
        canvasJQ.unbind("mousemove");
        // Obtaining image url:
        signature.val(canvas.toDataURL());
    });
});

// var openNav = document.getElementById("menu");

// var closeNav = document.getElementById("close");

// var overlay = document.querySelector(".overlay");

// var sideNav = document.querySelector(".navbar");

// $(".menu").on("click", function () {
//     $(".navbar").classList.add("on");
// });

// $(".close").on("click", function () {
//     $(".navbar").classList.remove("on");
// });

// $(".navbar").on("click", function (e) {
//     e.stopPropagation();
// });

// $(".menu").on("click", function () {
//     $(".navbar").toggleClass("on");
// });

// (function () {
//     var navBar = document.getElementById("side-nav");
//     var openNav = document.getElementById("nav");
//     var closeNav = document.getElementById("close-x");

//     openNav.addEventListener("click", function () {
//         navBar.classList.add("overlay");
//         navBar.style.visibility = "visible";
//     });

//     closeNav.addEventListener("click", function () {
//         navBar.classList.remove("overlay");
//         navBar.style.visibility = "hidden";
//     });
// })();
