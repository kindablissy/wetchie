const ROOT = document.getElementById("root");
const drawingbox = document.getElementById("canvas0");
drawingbox.style.backgroundColor = "white";

const layers = document.getElementsByTagName("canvas");
var currentLayer = layers[0];
var recorded_mousePos = { old: { x: 0, y: 0 } };
var drawing = false;
var eraser = false;
var currentContext = layers[0].getContext("2d");
var pkeys = {
  shiftDown: false,
  d: true,
};
var currentLineWidth = 1;
var currentColor = "rgb(0,0,0)";

const changeLayer = (number) => {
  currentLayer = layers[number];
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

const createContext = (element, position) => {
  const ctx = element.getContext("2d");
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
});

window.addEventListener("keyup", (e) => {
  if (e.code == "ShifRight" || "ShiftLeft") {
    if (pkeys.shiftDown) {
      pkeys.shiftDown = false;
      pkeys.d = false;
    }
  }
});

const clear = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

for (let element of layers) {
  element.onmouseleave = () => {
    drawing = !true;
  };
  element.onmousedown = (e) => {
    if (drawing) return;
    else drawing = !drawing;
    currentContext = createContext(currentLayer, {
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
