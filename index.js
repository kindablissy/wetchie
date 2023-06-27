const ROOT = document.getElementById("root");

const Element = (style) => {
  const element = document.createElement("div");
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

ROOT.appendChild(
  ColorBox({ height: "30px", width: "30px", backgroundColor: "red" })
);
