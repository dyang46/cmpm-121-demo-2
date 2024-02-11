import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
//const app1: HTMLDivElement = document.querySelector("#app")!;


const gameName = "My Drawing Board";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvasBlock = document.createElement("canvas"); // the canvas space

const clearButton = document.createElement("button");
clearButton.innerHTML = "CLEAR";
clearButton.addEventListener('click', UpdateCanvas); // for clearing the canvas

const undoButton = document.createElement("button");
undoButton.innerHTML = "UNDO";

const redoButton = document.createElement("button");
redoButton.innerHTML = "REDO";

const thinMarker = document.createElement("button");
thinMarker.innerHTML = "Thiner";

const thickMarker = document.createElement("button");
thickMarker.innerHTML = "Thicker";

const changeTool = document.createElement("button");
changeTool.innerHTML = "Tool/";

const brushSize = document.createElement("div");
brushSize.innerHTML = "Current: Marker  Size: 1";

app.append(header, clearButton,undoButton,redoButton);



//canvas + content
const canvas = canvasBlock as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Drawing variables
let isDrawing = false;
//ctx.lineWidth = 1; // Hardcoded line width for now
ctx.strokeStyle = '#000000'; // Hardcoded line color for now
let widthRate = 1;
ctx.lineWidth = widthRate;

//let lines: { x: number; y: number }[][] = []; //all actions
//let currentLine: { x: number; y: number }[] = []; // the most recent action
//let redoList: { x: number; y: number }[][] = []; // the list for redo

let currentLine: MarkerLine | null;
let lines: MarkerLine[] = [];
let redoList: MarkerLine[] = [];
let currentTool: "Marker" | "Sticker" = "Marker";

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);
    currentLine = new MarkerLine(x, y, widthRate);
    lines.push(currentLine);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || !currentLine) return;
    const { x, y } = getCanvasCoordinates(e);
    currentLine.drag(x, y);
    canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    redoList = []; // Clear redo stack on new drawing
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach(line => line.display(ctx));
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

thickMarker.addEventListener("click", () => {
  widthRate += 1;
  brushSize.textContent = `Current: ${currentTool} Size: ${widthRate}`;
});

thinMarker.addEventListener("click", () => {
  if (widthRate > 1) {
    widthRate -= 1;
  }
  brushSize.textContent = `Current: ${currentTool} Size: ${widthRate}`;
});

changeTool.addEventListener("click", () => {
  if (currentTool =="Marker") {
    currentTool = "Sticker";
  } else {
    currentTool = "Marker";
  }
  brushSize.textContent = `Current: ${currentTool} Size: ${widthRate}`;
});

app.append(canvas);
//app.append(undoButton, redoButton);
app.append(changeTool,thickMarker, thinMarker, brushSize);

/////Class//// 
/////the class structure is from chatGPT
class MarkerLine {
  private pos: { x: number; y: number }[] = [];
  private thick: number;
  constructor(initX: number, initY: number,thick: number) {
    this.pos.push({ x: initX, y: initY });
    this.thick = thick;
    
  }

  drag(x: number, y: number): void {
      this.pos.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.pos.length === 0) {        
      return;
    }
    ctx.beginPath();
    ctx.lineWidth = this.thick;
    this.pos.forEach((pos, index) => {
        if (index === 0) {
            ctx.moveTo(pos.x, pos.y);
        } else {
            ctx.lineTo(pos.x, pos.y);
        }
    });
    ctx.stroke();
  }
}
/////Functions////

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