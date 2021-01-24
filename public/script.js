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

///// Touchscreen signature to be improved! /////

canvasJQ.on("touchstart", onTouchStart, false);

function onTouchStart(e) {
    context.fillRect(0, 0, 300, 300);
    signature.val(canvas.toDataURL());
}
