import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "My Drawing Board";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvasBlock = document.createElement("canvas"); // the canvas space

const clearButton = document.createElement("button");
clearButton.innerHTML = "CLEAR";
//
app.append(header, clearButton);

clearButton.addEventListener('click', UpdateCanvas); // for clearing the canvas



//canvas + content
const canvas = canvasBlock as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Drawing variables
let isDrawing = false;
ctx.lineWidth = 1; // Hardcoded line width for now
ctx.strokeStyle = '#000000'; // Hardcoded line color for now

function getCanvasCoordinates(event: MouseEvent): { x: number; y: number } {
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / canvasRect.width;
  console.log("scaleX is: " + scaleX);
  const scaleY = canvas.height / canvasRect.height;
  const x = (event.clientX - canvasRect.left) * scaleX;
  const y = (event.clientY - canvasRect.top) * scaleY;
  return { x, y };
}

function UpdateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(event: MouseEvent) {
  isDrawing = true;
  const { x, y } = getCanvasCoordinates(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
}


function draw(event: MouseEvent) {
  if (!isDrawing) return;
  const { x, y } = getCanvasCoordinates(event);
  ctx.lineTo(x, y);
  ctx.stroke();
}


function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}


canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
app.append(canvas);