
const socket = io("https://sketchbook-project4-lv.onrender.com");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const sizeDisplay = document.getElementById("sizeDisplay");


let drawing = false;
let lastX, lastY;
let currentColor = "#000000";
let currentSize = 2;
let mySide = null; // be "left" or "right"

// receive side assignment from server
socket.on("assignSide", (side) => {
  mySide = side;
  console.log(`You are drawing on the ${side} side`);
  drawSideDivider();
});

// draw a visual divider line
function drawSideDivider() {
  ctx.save();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.restore();
}

// pages background image
const backgroundImage = new Image();
backgroundImage.src = "Images/Pages.png";
backgroundImage.onload = () => {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  if (mySide) drawSideDivider();
};

// color picker
colorPicker.addEventListener("change", (e) => {
  currentColor = e.target.value;
  ctx.strokeStyle = currentColor;
});

//  brush size
brushSize.addEventListener("input", (e) => {
  currentSize = e.target.value;
  sizeDisplay.textContent = currentSize;
});


canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const halfWidth = canvas.width / 2;
  
  //user drawing on their side
  if (mySide === "left" && x > halfWidth) {
    alert("Please draw on the left side!");
    return;
  }
  if (mySide === "right" && x < halfWidth) {
    alert("Please draw on the right side!");
    return;
  }
  
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseup", () => (drawing = false));

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  
  const x = e.offsetX;
  const halfWidth = canvas.width / 2;
  
  // restrict drawing to assigned side
  if ((mySide === "left" && x > halfWidth) || (mySide === "right" && x < halfWidth)) {
    drawing = false;
    return;
  }
  
  const [newX, newY] = [e.offsetX, e.offsetY];
  drawLine(lastX, lastY, newX, newY, currentColor, currentSize, true);
  [lastX, lastY] = [newX, newY];
});

function drawLine(x1, y1, x2, y2, color, size, emit) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  //socket emits our draing data as a JSON object
  if (emit) socket.emit("draw", { x1, y1, x2, y2, color, size });
}

//when socket receives "draw" event, it passes the JSON data to our drawLine function
socket.on("draw", ({ x1, y1, x2, y2, color, size }) => drawLine(x1, y1, x2, y2, color, size, false));

const clearButton = document.getElementById("clear");
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawSideDivider();
  socket.emit("clear");
});

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawSideDivider();
});


