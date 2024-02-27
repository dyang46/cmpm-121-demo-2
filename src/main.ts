import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Drawing Board";

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

const custSticker = document.createElement("button");
custSticker.innerHTML = "*Magic Sticker*";

const exportButton = document.createElement("button");
exportButton.innerHTML = "High-res Export";

const brushSize = document.createElement("div");
brushSize.innerHTML = "Current: Marker  Size: 1";

const stickerBox = document.createElement("div");

const slider: HTMLInputElement = document.createElement('input');
slider.type = 'range';
slider.min = '0';
slider.max = '360';
slider.value = '0';
slider.id = 'rotation-slider';

const stickerList = [ "🎆", "🎇", "💟"];

app.append(header, clearButton,undoButton,redoButton);

//canvas + content
const canvas = canvasBlock as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Drawing variables
let isDrawing = false;

let hue = parseInt(slider.value);
let widthRate = 1;
ctx.lineWidth = widthRate;

let currentLine: MarkerLine | null = null;
let lines: MarkerLine[] = []; // all drawn lines
let redoList: MarkerLine[] = [];
let currentTool: "Marker" | "Sticker" = "Marker";
let currentSticker: string | "🎆" = "🎆";
let userInput: string | null = null;
let previewTool: Preview | null = null;
canvas.width = 256;
canvas.height = 256;

stickerList.forEach((name) => {
  AddSticker(name);
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { x, y } = getCanvasCoordinates(e);
  if (currentTool== "Marker") {
    currentLine = new MarkerLine(x, y, widthRate,hue);
    lines.push(currentLine);
  } else {
    currentLine = new StickerPos(x, y, widthRate, hue,currentSticker);
    lines.push(currentLine);
  } 
  
  //canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  const { x, y } = getCanvasCoordinates(e);
  
  if (!isDrawing || !currentLine) {
    if (currentTool == "Marker") {
      previewTool = new Preview(x, y, "Marker",hue);
      previewTool.draw(ctx);
    } else {
      previewTool = new Preview(x, y, "Sticker",hue);
      previewTool.draw(ctx);
    }

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
    changeTool.innerHTML = "Marker";
  } else {
    currentTool = "Marker";
    changeTool.innerHTML = "Sticker";
  }
  brushSize.textContent = `Current: ${currentTool} Size: ${widthRate}`;
});

custSticker.addEventListener("click", () => {
  let note = prompt("Input plz","🧽");
  userInput = note;
  if (userInput) {
    stickerList.push(userInput);
    AddSticker(userInput);
  }
});

exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1024;
  tempCanvas.height = 1024;
  const tempCtx = tempCanvas.getContext("2d");
  if (tempCtx) {
    tempCtx.scale(4, 4);
    lines.forEach((MarkerLine) => {
      MarkerLine.display(tempCtx);
    });
  }
  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

slider.addEventListener("input", () => {
  hue = parseInt(slider.value);
});


app.appendChild(canvas);
app.append(changeTool,thickMarker, thinMarker, brushSize);
app.append(custSticker,exportButton);
app.appendChild(stickerBox);
app.append(slider);

slider.addEventListener('input', () => {

  console.log(slider.value); // Just an example action
});

/////Class//// 
/////the class structure is from chatGPT
class MarkerLine {
  private pos: { x: number; y: number }[] = [];
  private thick: number;
  private color: number
  constructor(initX: number, initY: number,thick: number,color:number) {
    this.pos.push({ x: initX, y: initY });
    this.thick = thick;    
    this.color = color;
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
    ctx.strokeStyle = `hsl(${this.color}, 100%, 50%)`;
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
/////the end of citing

//to draw sticker
class StickerPos extends MarkerLine {
  private content: string; 
  private x: number;
  private y: number;
  private initSize: number;

  constructor(initX: number, initY: number,thick: number,color:number,content: string) {
    super(initX,initY,thick,color);
    this.x = initX;
    this.y = initY;
    this.content = content; 
    this.initSize = thick;

  }

  drag(x: number, y: number): void {
    this.x = x;
    this.y = y;

  }

  display(ctx: CanvasRenderingContext2D): void {

    ctx.font = `${this.initSize * 10}px Arial`;

    ctx.fillText(this.content, this.x,this.y);
  }
}

//to control preview
class Preview{
  private x: number;
  private y: number;
  private toolType: string;
  private color: number;
  constructor(x: number, y: number, toolType: string, color: number) {
    this.x = x;
    this.y = y;
    this.toolType = toolType;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
 
    canvas.dispatchEvent(new Event("tool-moved"));
    if (this.toolType == "Marker") {
      ctx.strokeStyle = `hsl(${this.color}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, widthRate, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.font = `${widthRate*10}px Arial`;
      ctx.fillText(currentSticker, this.x, this.y);
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

//To add sticker button
function AddSticker(name: string) {
  const button = document.createElement('button');
  button.innerHTML = name;
  button.id = name;
  button.addEventListener('click', () => {
    currentSticker = button.id;
    canvas.dispatchEvent(new Event("tool-moved"));
  });
  button.addEventListener('dblclick', () => {
    let note = prompt("New Input *v*", name);
    if (note) {
      button.innerHTML = note;
      button.id = note;
    }
  });
  stickerBox.appendChild(button);  
}




 
