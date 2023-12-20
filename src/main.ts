import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "My Drawing Board";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvasBlock = document.createElement("canvas"); // the canvas space

const clearButton = document.createElement("button");
clearButton.innerHTML = "CLEAR";

const undoButton = document.createElement("button");
undoButton.innerHTML = "UNDO";


const redoButton = document.createElement("button");
redoButton.innerHTML = "REDO";

app.append(header, clearButton);

clearButton.addEventListener('click', UpdateCanvas); // for clearing the canvas



//canvas + content
const canvas = canvasBlock as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Drawing variables
let isDrawing = false;
ctx.lineWidth = 1; // Hardcoded line width for now
ctx.strokeStyle = '#000000'; // Hardcoded line color for now

let lines: { x: number; y: number }[][] = []; //all actions
let currentLine: { x: number; y: number }[] = []; // the most recent action
let redoList: { x: number; y: number }[][] = []; // the list for redo

canvas.addEventListener("mousedown", (e) => { //start drawing if mouse down
  isDrawing = true;
  const { x, y } = getCanvasCoordinates(e);
  currentLine = [{ x, y }];
  lines.push(currentLine);
});

canvas.addEventListener("mouseup", () => { //stop drawing if mouse up or leave
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("drawing-changed", () => { //
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach(line => {
      ctx.beginPath();
      line.forEach((point, index) => {
          if (index === 0) {
              ctx.moveTo(point.x, point.y);
          } else {
              ctx.lineTo(point.x, point.y);
          }
      });
      ctx.stroke();
  });
  console.log("Positions:", lines);
});

undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop();
      if (lastLine) {
        redoList.push(lastLine);
      }
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

redoButton.addEventListener("click", () => {
    if (redoList.length > 0) {
      const redoLine = redoList.pop();
      if (redoLine) {
        lines.push(redoLine);
      }
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) {
    return;
  }
  const { x, y } = getCanvasCoordinates(e);
  currentLine.push({ x, y });
  redoList = []; 
  canvas.dispatchEvent(new Event("drawing-changed"));
});



app.append(canvas);
app.append(undoButton, redoButton);

function UpdateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //to clear
  lines = [];  
}

function getCanvasCoordinates(event: MouseEvent): { x: number; y: number } { //get the right position
const canvasRect = canvas.getBoundingClientRect();
const scaleX = canvas.width / canvasRect.width;
const scaleY = canvas.height / canvasRect.height;
const x = (event.clientX - canvasRect.left) * scaleX;
const y = (event.clientY - canvasRect.top) * scaleY;
return { x, y };
}