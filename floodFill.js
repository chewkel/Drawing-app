/*

Ben Craddock - 33733570 

*/

/*

-This function is designed to fill in any closed shape with the selected colour.
-This function prevents the fill code executing as the mouse is dragged: only
executing when the mouse is clicked - and then only executing again after another
click
-The function fills adjacent pixels to the one clicked with the selected colour in
all directions until it reaches a pixel of a different colour to the one originally
clicked.

*/

/*

Basis for this flood fill algorithm was obtained from the following link:

https://codeguppy.com/code.html?ayLSdMZfjz8aJRGU7KfL
(Attribution credit: codeguppy.com)

However I changed and modified the following things to allow for functionality within
this particular drawing application:
-implemented a similar constructor setup - methods are now properties of object
-removed animation - fill is now instant
-passed in the palette object so different colours can be selected
-implemented a mouseClicked system so that the fill would not repeat if the mouse is
held (the original used a key press to fill so this was not an issue there)
-used only a queue for storing coordinates to be filled as opposed to both a stack
and a queue to save on memory and improve efficiency
-instead of using imageData and other default JS functions - I directly manipulated
the pixels[] array that comes as standard within the p5.js library, as well as using
updatePixels() and loadPixels()
-implemented a system to check whether a fill would be taking place over the same
colour - in which case the fill would have no effect. This was done to improve
efficiency by only executing the lines of code that were necessary (this system is
composed of the getArrayEquality() method and the selection statements within the
draw() method)
-removed unnecessary methods that would have had no effect given the composition of
this drawing application
-changed the stack setup in the original to use a more queue-like structure - using
.shift() to remove already processed coordinates in the queue

*/

//define constructor for fill tool - pass in the palette to get current fill
function FloodFill(palette){
    //sets the icon for the tool - in this case it is specified by a string
    //value that points to an image path
	this.icon = "assets/bucket.jpg";
    
	this.name = "floodFill"; //ensures that the floodFill tool object is valid by
                          //assigning an icon as well as a name.
    
    this.currentPixelColour = null; //initialise object property for clicked pixel colour
    
    //creating a system for preventing repetition of execution when mouse is held:
    var mouseClicked = false; //define boolean for if mouse has been clicked
    
    //defines the drawing function for the fill tool
	this.draw = function(){
        //the code to fill only executes if the mouse if clicked within the canvas
        if (mouseIsPressed && this.getValidCoords(mouseX, mouseY)){
            if (!mouseClicked){
                //only fills if the colour clicked isn't the selected colour: this
                //ensures stability and prevents a stack overflow crash.
                if (!this.getArrayEquality(get(mouseX, mouseY),
                                           color(this.updateColour()).levels)){
                    
                    //sets the current colour to the colour of pixel clicked
                    this.currentPixelColour = this.selectColourRegion(mouseX,
                                                                      mouseY);
                    this.bucketFill(mouseX, mouseY); //fill region
                }
                mouseClicked = true; //set mouse clicked to true while mouse is held
            }
        }
        else{
            mouseClicked = false; //allow for another mouse click
        }
    }
    
    //updateColour() - returns the palette current fill
    this.updateColour = function(){
        try{
            return palette.getSelectedColour();
        }
        catch (e){
            return "black"; //modularity - if the palette fails then return black
        }
    }
    
    //bucketFill() - generates the coordinate data to change to colour
    //parameters:
    //x: the x coordinate from where the fill began
    //y: the y coordinate from where the fill began
    this.bucketFill = function(x, y){
        
        /*
        coords[] is a queue in the form of a 2d array; data in the following format:
        -coords[i] points to another array [x, y]
        -coords[i][j] points to either an x or y value for a coordinate specified by
        coords[i] (where j === 0 and j === 1 points to x and y values respectively).
        
        -the head of the queue is the pixel being interrogated for colour
        */
        
        let coords = []; //local coordinate values queue (empty)
        coords.push([x, y]); //add the point from where the fill starts
        
        loadPixels(); //load current canvas data into pixels[]
        
        //loop that explores pixels adjacent to the originally clicked pixel and pushes
        //them to the coords[] array if they are the same colour
        while (coords.length > 0){
            //sets the value of x and y to the first value in the queue
            x = coords[0][0];
            y = coords[0][1];
            coords.shift(); //dequeue
            
            //do not push the values of adjacent pixels or fill colour if the colour of
            //this pixel at (x, y) is not the same colour as the original colour:
            if (!this.getArrayEquality(this.selectColourRegion(x, y),
                                       this.currentPixelColour)){
                continue;
            }
            
            //push the coordinates that are to the right, left, below and above (x, y);
            coords.push([x + 1, y]);
            coords.push([x - 1, y]);
            coords.push([x, y + 1]);
            coords.push([x, y - 1]);
            
            this.addColour(x, y); //change the pixels[] array at index (x, y).
        }
        updatePixels(); //apply the data in pixels[] to the canvas
    }
    
    //selectColourRegion() - returns a pixel array for data at coords (x, y).
    //parameters:
    //-x: the x coordinate to draw data from
    //-y: the y coordinate to draw data from 
    this.selectColourRegion = function(x, y){
        //because pixels[] stores new pixel data every 4 elements: calculate index-
        let pixelIndex = 4 * (x + (y * width)); //get the index for data at x, y
        
        //return the colour data accordingly:
        return [
            pixels[pixelIndex],
            pixels[pixelIndex + 1],
            pixels[pixelIndex + 2],
            pixels[pixelIndex + 3]
        ];
    }
    
    //addColour() - alters the pixels[] array according to the coordinates passed
    //parameters:
    //-x: the index at which to calculate and change colour
    //-y: the index at which to calculate and change colour
    this.addColour = function(x, y){
        let colour;
        try{
            colour = color(palette.getSelectedColour()); //get current fill
        }
        catch (e){
            colour = "black"; //modularity - if the palette fails then return black
        }
        let pixelIndex = 4 * (x + (y * width));
        pixels[pixelIndex] = red(colour);
        pixels[pixelIndex + 1] = green(colour);
        pixels[pixelIndex + 2] = blue(colour);
        pixels[pixelIndex + 3] = alpha(colour);
    }
    
    //getArrayEquality() - returns a boolean based on whether arrays passed are equal
    //parameters:
    //-array: array to compare to other passed array
    //-array2: array to compare to other passed array
    this.getArrayEquality = function(array, array2){
        let arrayEquality = false;
        for (let i = 0; i < array.length; i++){
            if (array[i] !== array2[i]){
                return false; //break loop if there is a difference
            }
        }
        return true;
    }
    
    //getValidCoords() - returns whether the passed coords is within the canvas
    //parameters:
    //-x: x coordinate to check
    //-y: y coordinate to check
    this.getValidCoords = function(x, y){
        let validity = false;
        
        //ternary operator to set validity if x and y are within bounds
        (x <= width && x >= 0 && y <= height && y >= 0) ? 
            validity = true : validity = false;
        return validity;
    }
}
