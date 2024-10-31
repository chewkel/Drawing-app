// Global variables that will store the toolbox colour palette
// and the helper functions.
var toolbox = null;
var colourP = null;
var helpers = null;

let mySound;

function preload() {
  soundFormats("mp3", "ogg");
  mySound = loadSound("assets/portal_radio");
}

function setup() {
  //create a canvas to fill the content div from index.html
  canvasContainer = select("#content");
  var c = createCanvas(
    canvasContainer.size().width,
    canvasContainer.size().height
  );
  c.parent("content");

  //create helper functions and the colour palette
  helpers = new HelperFunctions();
  colourP = new ColourPalette();

  //create a toolbox for storing the tools
  toolbox = new Toolbox();

  //add the tools to the toolbox.
  toolbox.addTool(new FreehandTool());
  toolbox.addTool(new LineToTool());
  toolbox.addTool(new SprayCanTool());
  toolbox.addTool(new mirrorDrawTool());
  toolbox.addTool(new RectangleTool());
  toolbox.addTool(new StarTrailTool());
  toolbox.addTool(new EraserTool());
  toolbox.addTool(new CurveTool());
  toolbox.addTool(new FloodFill(colourP));
  toolbox.addTool(new SelectTool());
  backgroundC();
  background(255);
}

function draw() {
  //call the draw function from the selected tool.
  //hasOwnProperty is a javascript function that tests
  //if an object contains a particular method or property
  //if there isn't a draw method the app will alert the user
  if (toolbox.selectedTool.hasOwnProperty("draw")) {
    toolbox.selectedTool.draw();
  } else {
    alert("it doesn't look like your tool has a draw method!");
  }
}

function keyPressed() {
  if (keyIsDown(32)) {
    // spacebar
    if (mySound.isPlaying()) {
      // .isPlaying() returns a boolean
      mySound.pause(); // .stop() will stop the sound
    }
    else{
      mySound.loop(); // .play() will resume from .paused() position
    }
   
  }
}
