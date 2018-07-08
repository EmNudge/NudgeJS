const canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight,
    boxes = [],
    mouse = { x: width/2, y: height/2 };

function setup() {
    boxes.push(
        new NUDGE.Box(NUDGE.random(100, 200), NUDGE.random(100, 200))
            .addVectors(50, 50)
    )
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    for (box of boxes) {
        box.draw(ctx);
        if (box.isColliding('bounds', [0, 0, width, height])) box._col = NUDGE.randColor();
    }
    requestAnimationFrame(draw);
}

document.addEventListener("mousemove", e => {
    boxes[0].gravitateTo(e.clientX, e.clientY, 5);
})

document.addEventListener("mousemove", e => {
})

setup(); draw();