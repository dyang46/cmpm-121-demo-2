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

const firstSticker = document.createElement("button");
firstSticker.innerHTML = "🎆";

const secondSticker = document.createElement("button");
secondSticker.innerHTML = "Tool/";

const thirdSticker = document.createElement("button");
thirdSticker.innerHTML = "Tool/";

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

let currentLine: MarkerLine | null = null;
let lines: MarkerLine[] = [];
let redoList: MarkerLine[] = [];
let currentTool: "Marker" | "Sticker" = "Marker";
let previewTool: Preview | null = null;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { x, y } = getCanvasCoordinates(e);
  currentLine = new MarkerLine(x, y, widthRate);
  lines.push(currentLine);
  //canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  const { x, y } = getCanvasCoordinates(e);
  
  if (!isDrawing || !currentLine) {
    previewTool = new Preview(x, y, "Marker");
    previewTool.draw(ctx);

  } else {

    currentLine.drag(x, y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }

});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  currentLine = null;
  redoList = []; // Clear redo stack on new drawing
  canvas.dispatchEvent(new Event("drawing-changed"));
  
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
  currentLine = null;
  redoList = []; // Clear redo stack on new drawing
  canvas.dispatchEvent(new Event("drawing-changed"));
  
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach(line => line.display(ctx));
});

canvas.addEventListener("tool-moved", () => {
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

//thickness +1 for marker
thickMarker.addEventListener("click", () => {
  widthRate += 1;
  brushSize.textContent = `Current: ${currentTool} Size: ${widthRate}`;
});

//thickness -1 for marker
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

app.appendChild(canvas);
//app.append(undoButton, redoButton);
app.append(changeTool,thickMarker, thinMarker, brushSize);
app.append(firstSticker);

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
/////END////

class Preview{
  private x: number;
  private y: number;
  private toolType: string;
  constructor(x: number, y: number, toolType: string) {
    this.x = x;
    this.y = y;
    this.toolType = toolType;
  }

  draw(ctx: CanvasRenderingContext2D) {
 
    canvas.dispatchEvent(new Event("tool-moved"));
    if (this.toolType == "Marker") {
      ctx.beginPath();
      ctx.arc(this.x, this.y, widthRate, 0, 2 * Math.PI);
      ctx.stroke();
    }
}
}

//to clear the canvas
function UpdateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines = [];  
}

//Get the correct mouse position
function getCanvasCoordinates(event: MouseEvent): { x: number; y: number } { 
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;
  const x = (event.clientX - canvasRect.left) * scaleX;
  const y = (event.clientY - canvasRect.top) * scaleY;
  return { x, y };
}