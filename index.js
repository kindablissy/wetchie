const ROOT = document.getElementById("root");
const drawingbox = document.getElementById("canvas0");
drawingbox.style.backgroundColor = "white";

var layers = [];
for (let i of document.getElementsByTagName("canvas")) {
  layers.push(i.getContext("2d"));
}
var currentLayer = 0;
var recorded_mousePos = { old: { x: 0, y: 0 } };
var drawing = false;
var eraser = false;
var currentContext = layers[0];
var pkeys = {
  shiftDown: false,
  d: true,
};
var currentLineWidth = 1;
var currentColor = "rgb(0,0,0)";

const changeLayer = (number) => {
  currentLayer = number;
  currentContext = layers[currentLayer];
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
    if (ubuffer.length > limit) ubuffer.shift();
  };
  const rpush = (state) => {
    rBuffer.push(state);
  };
  const redo = () => {
    const state = rBuffer.pop();
    if (!state) return;
    console.log("here");
    changeLayer(state.ctx);
    currentContext.putImageData(state.imagedata, 0, 0);
    pushTree();
    return state;
  };
  const undo = () => {
    const state = ubuffer.pop();
    if (!state || state == undefined) return;
    changeLayer(state.ctx);
    rpush({
      ctx: currentLayer,
      imagedata: currentContext.getImageData(
        0,
        0,
        currentContext.canvas.width,
        currentContext.canvas.width
      ),
    });
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
    eraser = true;
  }
  if (e.code == "KeyB") {
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
  }
  if (e.code == "KeyZ" && e.ctrlKey) {
    undo();
  }
});

const clear = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

for (let element of layers) {
  element.canvas.onmouseleave = () => {
    drawing = !true;
  };
  element.canvas.onmousedown = (e) => {
    if (drawing) return;
    else drawing = !drawing;
    upush();
    currentContext = createContext(layers[currentLayer], {
      x: e.offsetX,
      y: e.offsetY,
    });
    currentContext.lineWidth = currentLineWidth;
    currentContext.strokeStyle = currentColor;
    recorded_mousePos.old = {
      x: e.offsetX,
      y: e.offsetY,
    };
  };
}

window.onmouseup = () => {
  if (!drawing) return;
  drawing = false;
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
  if (eraser & drawing) {
    erase(currentContext, e);
    return;
  }
  sketch(currentContext, e, currentColor);
};
