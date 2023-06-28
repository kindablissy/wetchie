const ROOT = document.getElementById("root");

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

const drawingbox = document.getElementById("canvas");
drawingbox.style.backgroundColor = "powderblue";
ROOT.appendChild(drawingbox);

var recorded_mousePos = {};
recorded_mousePos = { old: { x: 0, y: 0 } };
var drawing = false;

const createContext = (element, position) => {
  const ctx = element.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(position.x, position.y);
  return ctx;
};

var currentContext = null;

const sketch = (ctx, e) => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  if (
    true ||
    (recorded_mousePos.old.x - x) * (recorded_mousePos.old.x - x) +
      (recorded_mousePos.old.y - y) * (recorded_mousePos.old.y - y) <
      100
  ) {
    console.log(x);
    ctx.moveTo(recorded_mousePos.old.x, recorded_mousePos.old.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
    recorded_mousePos.old = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
};

drawingbox.onmousedown = (e) => {
  if (drawing) return;
  else drawing = !drawing;
  currentContext = createContext(drawingbox, {
    x: MouseEvent.offsetX,
    y: MouseEvent.offsetY,
  });
  recorded_mousePos.old = {
    x: MouseEvent.offsetX,
    y: MouseEvent.offsetY,
  };
  console.log("clicked");
};

drawingbox.onmouseup = () => {
  if (!drawing) return;
  drawing = false;
  recorded_mousePos = { old: { x: 0, y: 0 } };
};

document.onmousemove = (e) => sketch(currentContext, e);
