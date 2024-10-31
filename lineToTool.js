class LineToTool {
  constructor() {
    this.icon = "assets/lineTo.jpg";
    this.name = "LineTo";

    var startMouseX = -1; // set the startMouseX to -1
    var startMouseY = -1; // set the startMouseY to -1
    var drawing = false; // false means it's not drawing

    this.draw = function () {
      if (mouseIsPressed) {
        // if mouse is pressed
        if (startMouseX == -1) {
          // if it's not drawing
          startMouseX = mouseX; // set the startMouseX to the current mouseX
          startMouseY = mouseY; // set the startMouseY to the current mouseY
          drawing = true; // set drawing to true
          loadPixels(); // load the pixels
        } else {
          updatePixels(); // update the pixels
          line(startMouseX, startMouseY, mouseX, mouseY); // draw a line from the startMouseX and startMouseY to the current mouseX and mouseY
        }
      } else if (drawing) {
        // if mouse is not pressed and it's drawing
        loadPixels();
        drawing = false; // set drawing to false
        startMouseX = -1; // set startMouseX to -1
        startMouseY = -1; // set startMouseY to -1
      }
    };
  }
}
