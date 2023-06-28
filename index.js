const ROOT = document.getElementById("root");
const drawingbox = document.getElementById("canvas");
drawingbox.style.backgroundColor = "powderblue";
var recorded_mousePos = { old: { x: 0, y: 0 } };
var drawing = false;
var currentContext = null;
var pkeys = {
  shiftDown: false,
  d: true,
};

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

const sketch = (ctx, e) => {
  if (!drawing) return;
  let x = e.offsetX;
  let y = e.offsetY;
  if (
    (recorded_mousePos.old.x - x) * (recorded_mousePos.old.x - x) +
      (recorded_mousePos.old.y - y) * (recorded_mousePos.old.y - y) >
    // to have higher range for shift key to detect the direction more accurately
    (pkeys.shiftDown && !pkeys.d ? 1000 : 100)
  ) {
    if (pkeys.shiftDown) {
      const offsetx = recorded_mousePos.old.x - x;
      const offsety = recorded_mousePos.old.y - y;
      if (
        pkeys.d == "h" ||
        (!pkeys.d && offsetx * offsetx > offsety * offsety)
      ) {
        console.log("X here!");
        pkeys.d = "h";
        y = recorded_mousePos.old.y;
      } else {
        console.log("Y");
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
});

window.addEventListener("keyup", (e) => {
  if (e.code == "ShifRight" || "ShiftLeft") {
    if (pkeys.shiftDown) {
      pkeys.shiftDown = false;
      pkeys.d = false;
    }
  }
});

drawingbox.onmousedown = (e) => {
  if (drawing) return;
  else drawing = !drawing;
  currentContext = createContext(drawingbox, {
    x: e.offsetX,
    y: e.offsetY,
  });
  recorded_mousePos.old = {
    x: e.offsetX,
    y: e.offsetY,
  };
};

const clear = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

window.onmouseup = () => {
  if (!drawing) return;
  drawing = false;
  recorded_mousePos = { old: { x: 0, y: 0 } };
};

document.onmousemove = (e) => sketch(currentContext, e);
