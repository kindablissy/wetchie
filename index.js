const ROOT = document.getElementById("root");
const drawingbox = document.getElementById("canvas0");
drawingbox.style.backgroundColor = "white";
const layerShow = document.getElementById("currentlayershow");
var layers = [];
for (let i of document.getElementsByTagName("canvas")) {
  layers.push(i.getContext("2d", { willReadFrequently: true }));
}
var currentLayer = 0;
var recorded_mousePos = { old: { x: 0, y: 0 } };
var drawing = false;
var eraser = false;
var fillToolSelected = false;

const toolKey = {
  brush: 0,
  eraser: 1,
  fillTool: 2,
  shapeTool: 3,
};

var selectedTool = 0;

var currentContext = layers[0];
var pkeys = {
  shiftDown: false,
  d: true,
};
var currentLineWidth = 1;
var currentColor = "rgb(0,0,0)";
var currentcolorValue = {
  r: 0,
  g: 0,
  b: 0,
  a: 255,
};
const changeLayer = (number) => {
  currentLayer = number;
  currentContext = layers[currentLayer];
  layerShow.innerText = number + 1;
};

document
  .getElementById("rangeRed")
  .addEventListener("input", (e) => changeColor(e));

document.getElementById("linewidthRange").addEventListener("input", (e) => {
  currentLineWidth = e.target.value;
  document.getElementById("currentlinespan").innerText = currentLineWidth;
});
document
  .getElementById("rangeGreen")
  .addEventListener("input", (e) => changeColor(e));
document
  .getElementById("rangeBlue")
  .addEventListener("input", (e) => changeColor(e));

function changeColor() {
  ///Assigning variables for the primary colors
  var red = document.getElementById("rangeRed").value;
  var green = document.getElementById("rangeGreen").value;
  var blue = document.getElementById("rangeBlue").value;
  currentColor = "RGB(" + red + "," + green + "," + blue + ")";
  currentcolorValue.r = red;
  currentcolorValue.g = green;
  currentcolorValue.b = blue;

  document.getElementById("colorshow").style.backgroundColor = currentColor;
  document.getElementById("choosecolor").style.color = currentColor;
}

const Stack = () => {
  let stack = [];
  let size = 0;
  let limit = 0;
  const putStack = (element) => {
    if (limit != 0 && size + 1 > limit) {
      return;
    }
    stack.push(element);
  };
  const get = (element) => {
    return stack.pop(element);
  };

  return {
    stack: stack,
    put: putStack,
    get: get,
  };
};

const undoBuffer = (limit) => {
  const ubuffer = [];
  const rBuffer = [];
  const pushTree = () => {
    ubuffer.push({
      imagedata: currentContext.getImageData(
        0,
        0,
        currentContext.canvas.width,
        currentContext.canvas.height
      ),
      ctx: currentLayer,
    });
    // if (ubuffer.length > limit) ubuffer.shift();
  };
  const rpush = (state) => {
    rBuffer.push(state);
  };
  const redo = () => {
    const state = rBuffer.pop();
    if (!state) return;
    console.log("here");
    pushTree();
    changeLayer(state.ctx);
    currentContext.putImageData(state.imagedata, 0, 0);
    return state;
  };
  const undo = () => {
    const state = ubuffer.pop();
    if (!state || state == undefined) return;
    rpush({
      ctx: currentLayer,
      imagedata: currentContext.getImageData(
        0,
        0,
        currentContext.canvas.width,
        currentContext.canvas.width
      ),
    });
    changeLayer(state.ctx);
    currentContext.putImageData(state.imagedata, 0, 0);
    return state;
  };
  return {
    redo: redo,
    upush: pushTree,
    undo: undo,
  };
};

const { redo, upush, undo } = undoBuffer(10);

const Element = (style, tag = "div") => {
  const element = document.createElement(tag);
  const styles = Object.keys(style);
  for (let i in styles) {
    element.style[styles[i]] = style[styles[i]];
  }
  return element;
};

const ColorBox = (style) => {
  const element = Element(style);
  element.addEventListener("click", () => console.log("ColorBox Hit!!"));
  return element;
};

const DrawingBox = (style) => {
  const element = Element(style, "canvas");

  return element;
};

const createContext = (ctx, position) => {
  ctx.beginPath();
  ctx.moveTo(position.x, position.y);
  return ctx;
};

const fill = (imagedata, x = 0, y = 0, o_color, color) => {
  // x = (currentContext.canvas.width / 2 - 1) * 4;
  // y = currentContext.canvas.height / 2 - 1;
  let same = true;
  for (let i in o_color) {
    if (o_color[i] != color[i]) {
      same = false;
    }
  }
  if (same) return;
  console.log("filling!");
  traverseR(
    imagedata,
    x,
    y,
    currentContext.canvas.height,
    currentContext.canvas.width,
    o_color,
    color
  );
  traverse(
    imagedata,
    x + 4,
    y,
    currentContext.canvas.height,
    currentContext.canvas.width,
    o_color,
    color
  );
  upush();
  currentContext.putImageData(imagedata, 0, 0);
};

const traverseR = (array, x, y, h, w, o_color, n_color) => {
  let position = y * w * 4 + x;
  // console.log(position, x, y, w, h, o_color, n_color);
  // console.log(o_color);

  if (position > array.data.length) {
    return;
  }
  if (
    array.data[position] == o_color[0] &&
    array.data[position + 1] == o_color[1] &&
    array.data[position + 2] == o_color[2] &&
    array.data[position + 3] == o_color[3]
  ) {
    array.data[position] = n_color[0];
    array.data[position + 1] = n_color[1];
    array.data[position + 2] = n_color[2];
    array.data[position + 3] = n_color[3];
    // go left
    // if (Math.floor((position + 5) / (w * 4)) <= y) {
    //   traverseR(array, x + 4, y, h, w, o_color, n_color);
    // }
    // go right
    if ((position - 3) / (w * 4) > y)
      traverseR(array, x - 4, y, h, w, o_color, n_color);
    // go down
    if (x * y + w * 4 < array.data.length)
      traverseR(array, x, y + 1, h, w, o_color, n_color);
    // // go up
    if (position - w * 4 >= 0)
      traverseR(array, x, y - 1, h, w, o_color, n_color);
  }
};

// TODO: Need to optimize this.
const traverse = (array, x, y, h, w, o_color, n_color) => {
  let position = y * w * 4 + x;
  // console.log(position, x, y, w, h, o_color, n_color);

  if (position > array.data.length) {
    return;
  }
  if (
    array.data[position] == o_color[0] &&
    array.data[position + 1] == o_color[1] &&
    array.data[position + 2] == o_color[2] &&
    array.data[position + 3] == o_color[3]
  ) {
    array.data[position] = n_color[0];
    array.data[position + 1] = n_color[1];
    array.data[position + 2] = n_color[2];
    array.data[position + 3] = n_color[3];

    // go left
    if (Math.floor((position + 5) / (w * 4)) <= y) {
      traverse(array, x + 4, y, h, w, o_color, n_color);
    }
    // // go right
    // if ((position - 3) / (w * 4) > y)
    //   traverse(array, x - 4, y, h, w, o_color, n_color);
    // go down
    if (x * y + w * 4 < array.data.length)
      traverse(array, x, y + 1, h, w, o_color, n_color);
    // go up
    if (position - w * 4 >= 0)
      traverse(array, x, y - 1, h, w, o_color, n_color);
  }
};

const inverse = (imagedata) => {
  for (let i = 0; i < imagedata.data.length; i += 4) {
    imagedata.data[i] = 255 - imagedata.data[i];
    imagedata.data[i + 2] = 255 - imagedata.data[i + 2];
    imagedata.data[i + 1] = 255 - imagedata.data[i + 1];
  }
  // console.log(imdata.data);
  currentContext.putImageData(imagedata, 0, 0);
};

const sketch = (ctx, e, color = "rgb(0,0,0)") => {
  if (!drawing) return;
  let x = e.offsetX;
  let y = e.offsetY;
  if (
    (recorded_mousePos.old.x - x) * (recorded_mousePos.old.x - x) +
      (recorded_mousePos.old.y - y) * (recorded_mousePos.old.y - y) >
    // to have higher range for shift key to detect the direction more accurately
    (pkeys.shiftDown && !pkeys.d ? 1000 : 0)
  ) {
    if (pkeys.shiftDown) {
      const offsetx = recorded_mousePos.old.x - x;
      const offsety = recorded_mousePos.old.y - y;
      if (
        pkeys.d == "h" ||
        (!pkeys.d && offsetx * offsetx > offsety * offsety)
      ) {
        pkeys.d = "h";
        y = recorded_mousePos.old.y;
      } else {
        x = recorded_mousePos.old.x;
        pkeys.d = "v";
      }
    }
    ctx.lineTo(x, y);
    // const x = e.offsetX;
    // const y = e.offsetY;

    // ctx.fillRect(
    //   x - ctx.lineWidth / 2,
    //   y - ctx.lineWidth / 2,
    //   ctx.lineWidth,
    //   ctx.lineWidth
    // );
    ctx.stroke();
    recorded_mousePos.old = {
      x: x,
      y: y,
    };
  }
};

window.addEventListener("keydown", (e) => {
  if (e.code == "ShifRight" || "ShiftLeft") {
    if (!pkeys.shiftDown) pkeys.shiftDown = true;
  }

  if (e.code == "KeyD") {
    clear(currentContext);
  }
  if (e.code == "KeyE") {
    selectedTool = toolKey.eraser;
    eraser = true;
  }
  if (e.code == "KeyL") {
    selectedTool = toolKey.shapeTool;
    eraser = false;
  }
  if (e.code == "KeyB") {
    selectedTool = toolKey.brush;
    eraser = false;
  }
  if (e.code == "Digit1") {
    changeLayer(0);
  }
  if (e.code == "Digit2") {
    changeLayer(1);
  }
  if (e.code == "Digit3") {
    changeLayer(2);
  }
  if (e.code == "Digit4") {
    changeLayer(3);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code == "ShifRight" || "ShiftLeft") {
    if (pkeys.shiftDown) {
      pkeys.shiftDown = false;
      pkeys.d = false;
    }
  }

  if (e.code == "KeyY" && e.ctrlKey) {
    redo();
    return;
  }
  if (e.code == "KeyZ" && e.ctrlKey) {
    undo();
    return;
  }

  if (e.code == "KeyG") {
    selectedTool = toolKey.fillTool;
    drawing = false;

    fillToolSelected = true;
  }
});

const clear = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

for (let element of layers) {
  element.canvas.onmouseleave = () => {
    drawing = !true;
  };
  element.canvas.onclick = (e) => {
    if (selectedTool == toolKey.fillTool) {
      const data = currentContext.getImageData(
        0,
        0,
        currentContext.canvas.width,
        currentContext.canvas.height
      );
      const position =
        e.offsetY * currentContext.canvas.width * 4 + e.offsetX * 4;
      console.log([
        data.data[position + 0],
        data.data[position + 1],
        data.data[position + 2],
        data.data[position + 3],
      ]);
      fill(
        data,
        e.offsetX * 4,
        e.offsetY,
        [
          data.data[position + 0],
          data.data[position + 1],
          data.data[position + 2],
          data.data[position + 3],
        ],
        [
          currentcolorValue.r,
          currentcolorValue.g,
          currentcolorValue.b,
          currentcolorValue.a,
        ]
      );
    }
  };
  element.canvas.onmousedown = (e) => {
    if (drawing || selectedTool == toolKey.fillTool) return;
    else drawing = !drawing;
    upush();
    currentContext = createContext(layers[currentLayer], {
      x: e.offsetX,
      y: e.offsetY,
    });
    currentContext.lineWidth = currentLineWidth;
    currentContext.strokeStyle = currentColor;
    currentContext.fillStyle = currentColor;
    recorded_mousePos.old = {
      x: e.offsetX,
      y: e.offsetY,
    };
  };
}

window.onmouseup = () => {
  if (!drawing) return;
  drawing = false;
  if (selectedTool == toolKey.shapeTool) resolveShape();
  recorded_mousePos = { old: { x: 0, y: 0 } };
  currentContext.closePath();
};

const erase = (ctx, e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  ctx.clearRect(
    x - ctx.lineWidth / 2,
    y - ctx.lineWidth / 2,
    ctx.lineWidth,
    ctx.lineWidth
  );
};

document.onmousemove = (e) => {
  if ((selectedTool == toolKey.eraser) & drawing) {
    erase(currentContext, e);
    return;
  }
  if (selectedTool == toolKey.shapeTool && drawing) {
    return createShape("rectangle", e);
  }
  if (selectedTool == toolKey.brush) sketch(currentContext, e, currentColor);
};

var currentPath = null;

const createShape = (shape, e) => {
  const x = recorded_mousePos.old.x;
  const y = recorded_mousePos.old.y;
  const visual = layers[layers.length - 1];
  if (shape === "line") {
    currentPath = new Path2D();
    clear(visual);
    console.log("here");
    visual.lineWidth = currentLineWidth;
    visual.strokeStyle = currentColor;
    visual.fillStyle = currentColor;
    currentPath.moveTo(x, y);
    currentPath.lineTo(e.offsetX, e.offsetY);
    visual.stroke(currentPath);
  }
  if (shape === "rectangle") {
    currentPath = new Path2D();
    clear(visual);
    console.log("here");
    visual.lineWidth = currentLineWidth;
    visual.strokeStyle = currentColor;
    visual.fillStyle = currentColor;
    currentPath.moveTo(x, y);
    currentPath.rect(x, y, e.offsetX - x, e.offsetY - y);
    visual.stroke(currentPath);
  }
};

const resolveShape = () => {
  const visual = layers[layers.length - 1];
  clear(visual);
  currentContext.stroke(currentPath);
};
