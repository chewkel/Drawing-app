/*

Ben Craddock - 33733570 

*/

/*

-This function is designed to grab a rectangular portion of the screen and allow for the
user to click on it to move it around.
-The user will also have the option of clicking one of four circular knobs in the corners
of their selection so as to be able to resize their selection by dragging them.
-The intended user experience is that a red selection box will be drawn from the mouse's
original click poisition to where the mouse is released from so as to indicate to the
user the dimensions of their selection. A rectangle of the selected background colour
will be drawn at the site of selection so as to "remove" the selected region from the
canvas. The user will then be able to move and resize their selection as described above
to their liking.
-Once the mouse is clicked again, outside the bounds of the selection box, then the
resized/rearranged selection will be baked into the canvas and from this point, a new
selection can be made.

*/

//select tool constructor function
function SelectTool(){
    this.name = "selectTool";
    this.icon = "assets/select.jpg";
    
    this.selectionActive = false;
    
    //creating a system for preventing repetition of execution when mouse is held:
    var mouseClicked = false; //define boolean for if mouse has been clicked

    //variables to store the coordinates to be drawn from
    let prevMouseX = -2; //initialised to a unused value (-2)
    let prevMouseY = -2;
    
    //variables to store the original coordinates of the selection
    let originalX = -1;
    let originalY = -1;
    
    //initialise the coordinated to be drawn to the original position
    let x1 = originalX;
    let y1 = originalY;

    let selection = null; //image value for the displayed selection
    let draggingSelection = false;
    let resizing = false;
    
    let pixelBuffer = []; //used to ensure only what is intended is baked into canvas
    
    //used to determine when the corner knobs of the selection box are in use:
    this.topLeftKnobActive = false;
    this.topRightKnobActive = false;
    this.bottomLeftKnobActive = false;
    this.bottomRightKnobActive = false;
    
    var newSize = []; //holds the resized dimensions of the image (empty to begin with)
    
    //draw function - called every frame
    this.draw = function(){
        if (!this.selectionActive){ //if there is no active selection box
            this.applyBuffer(); //refresh the canvas to the previous saved state
            if (mouseIsPressed){
                if (this.getValidCoords(mouseX, mouseY)){ //if clicked in canvas:
                    if (!mouseClicked){
                        this.applyBuffer(); //refresh before starting a new selection
                        
                        //set the previous coords to the current mouse coords
                        prevMouseX = mouseX; 
                        prevMouseY = mouseY;
                        
                        mouseClicked = true;
                        
                        //set the original coords to the current mouse coords
                        originalX = mouseX;
                        originalY = mouseY;
                        
                        //save the current state of the canvas to the buffer
                        if (pixelBuffer.length === 0){ //only if there is none saved
                            pixelBuffer.push(pixels);
                        }
                    }
                    updatePixels(); //load pixels[] onto the canvas
                    
                    let wid; //temp variable for drawing the selection box width
                    let hei; //temp variable for drawing the selection box height
                    
                    //system to ensure that width is always non-negative:
                    //width and height are calculated as the distance from prev coords
                    if (mouseX < 0){
                        wid = 0 - prevMouseX;
                    }
                    else{
                        wid = mouseX - prevMouseX;
                    }
                    if (mouseY < 0){
                        hei = 0 - prevMouseY;
                    }
                    else{
                        hei = mouseY - prevMouseY;
                    }
                    if (prevMouseX > -1 && prevMouseY > -1){ //if a selection has begun:
                        this.drawSelectionBox(prevMouseX, prevMouseY, wid, hei); //box
                    }
                    
                }
            }
            else{ //if the mouse is released
                if (pixelBuffer.length > 0){ //canvas is updated to the previous saved state
                    this.applyBuffer();
                    pixelBuffer = []; //empty the buffer
                }
                if (mouseClicked){ //only executes if the mouse was previously clicked
                    this.selectionActive = true; //activate the selected region
                    
                    //the selection is grabbed based on where the mouse is in proximity
                    //to the original click - explained below:
                    if (mouseX - prevMouseX >= 1){
                        if (mouseY - prevMouseY >= 1){ //below and to the right
                            selection = this.getSelection(
                                prevMouseX,
                                prevMouseY,
                                mouseX - prevMouseX,
                                mouseY - prevMouseY
                            );
                        }
                        else{ //above and to the right
                            selection = this.getSelection(
                                prevMouseX, 
                                prevMouseY, 
                                mouseX - prevMouseX, 
                                (mouseY - prevMouseY) + 1
                            );
                        }
                    }
                    else{
                        if (mouseY - prevMouseY >= 1){ //below and to the left
                            selection = this.getSelection(
                                prevMouseX, 
                                prevMouseY, 
                                (mouseX - prevMouseX) + 1, 
                                mouseY - prevMouseY
                            );
                        }
                        else{ //above and to the left
                            selection = this.getSelection(
                                prevMouseX,
                                prevMouseY,
                                (mouseX - prevMouseX) + 1,
                                (mouseY - prevMouseY) + 1
                             );
                        }
                    }
                    
                    //deactivate the selection if it hasn't got a visible area:
                    if (selection.width < 5 && selection.height < 5){
                        this.selectionActive = false;
                    }
                    //set the original click position
                    x1 = originalX;
                    y1 = originalY;
                    
                    //draw a background-coloured rectangle underneath the selection:
                    push();
                    fill(colorInput2.value);
                    noStroke();
                    rectMode(CORNER);
                    rect(originalX, originalY, selection.width, selection.height);
                    pop();
                    
                    loadPixels(); //load canvas state into pixels[]
                    pixelBuffer.push(pixels); //push the loaded state to the buffer
                    pixels = pixelBuffer[0]; //set pixels[] to the buffer
                    this.applyBuffer(); //apply buffer
                    
                    //apply the selection again if there is adequate width and height
                    if (selection.width > 0 && selection.height > 0 && selection !== null){
                        image(selection, originalX, originalY);
                    }       
                }
                mouseClicked = false;
                prevMouseX = -1;
                prevMouseY = -1;
                return;
            }
        }
        else{ //if the selection is already active
            if (mouseIsPressed){ //if the mouse is clicked:
                if (!mouseClicked){ //set mouseClicked accordingly
                    mouseClicked = true;
                }
                
                //this block determines if the user wants to resize the selection
                //the knob (corner circle) that is clicked is based on mouse position
                if (!resizing){
                    if (dist(mouseX, mouseY, x1, y1) < 5){
                        this.topLeftKnobActive = true;
                        resizing = true;
                    }
                    else if (dist(mouseX, mouseY, x1 + selection.width, y1) < 5){
                        this.topRightKnobActive = true;
                        resizing = true;
                    }
                    else if (dist(mouseX, mouseY, x1 + selection.width, y1 + selection.height) < 5){
                        this.bottomRightKnobActive = true;
                        resizing = true;
                    }
                    else if (dist(mouseX, mouseY, x1, y1 + selection.height) < 5){
                        this.bottomLeftKnobActive = true;
                        resizing = true;
                    }
                    else if (
                        mouseX > x1 &&
                        mouseY > y1 &&
                        mouseX < x1 + selection.width &&
                        mouseY < y1 + selection.height &&
                        !resizing
                    ){ //this executes if the main area of the selection is clicked
                        draggingSelection = true;
                    }
                    else if (draggingSelection){ //drag the selection if true:
                        if (!this.deactivateSelection()){
                            this.dragSelection(draggingSelection);
                        } 
                    }
                    else{ //if nothing of value is clicked (i.e., outside the selection)
                        mouseClicked = false;
                        
                        //reset all values:
                        draggingSelection = false;
                        this.deactivateSelection();
                        try{ //selection could be null at this point - catch exceptions
                            image(selection, x1, y1);
                        }
                        catch (e){
                            selection = null;
                        }
                        selection = null;
                        loadPixels(); //save pixel state
                        x1 = -1; //reset coords
                        y1 = -1;
                    }
                }
                    
                if (draggingSelection){
                    this.dragSelection(draggingSelection);
                }
                
                //resizing code:
                //this uses try/catch for each as selection could be null
                if (this.topLeftKnobActive){
                    try{ //pass in the knob clicked to resize accordingly
                        newSize = this.resizeSelection("topLeft");
                    }
                    catch (e){
                        newSize = [0, 0, 0, 0]; //use 0 values to prevent undefined
                    }
                }
                else if (this.topRightKnobActive){
                    try{
                        newSize = this.resizeSelection("topRight");
                    }
                    catch (e){
                        newSize = [0, 0, 0, 0];
                    }
                }
                else if (this.bottomLeftKnobActive){
                    try{
                        newSize = this.resizeSelection("bottomLeft");
                    }
                    catch (e){
                        newSize = [0, 0, 0, 0];
                    }
                }
                else if (this.bottomRightKnobActive){
                    try{
                        newSize = this.resizeSelection("bottomRight");
                    }
                    catch (e){
                        newSize = [0, 0, 0, 0];
                    }
                }
            }
            else{ //if the mouse is NOT pressed
                mouseClicked = false
                draggingSelection = false;
                if (resizing){ //apply the new size generated
                    selection = get(newSize[0], newSize[1], newSize[2], newSize[3]);
                    //reset corner coords accordingly:
                    x1 = newSize[0];
                    y1 = newSize[1];
                    
                }
                //reset resize values:
                resizing = false;
                this.topLeftKnobActive = false;
                this.topRightKnobActive = false;
                this.bottomRightKnobActive = false;
                this.bottomLeftKnobActive = false;
            }
            try{
                if (!resizing){ //only draw the box when not resising:
                    //prevents the box from becoming part of the selection
                    this.drawSelectionBox(x1, y1, selection.width, selection.height);
                }
            }
            catch (e){
                return;
            }
        }   
    }
    
    //applyBuffer() - updates the pixels according to what is stored in pixelBuffer
    this.applyBuffer = function(){
        if (pixelBuffer.length > 0){
            pixels = pixelBuffer[0].slice(0);
            updatePixels();
        }
    }
    
    //dragSelection() - moves the selection to the mouse position
    //parameters:
    //-draggingSelection - boolean value to determine if the selection should be dragged
    this.dragSelection = function(draggingSelection){
        if (draggingSelection === true){
            this.applyBuffer(); //update the canvas
            push();
            noFill();
            imageMode(CENTER); //centre is the mouse position
            x1 = mouseX - selection.width / 2;
            y1 = mouseY - selection.height / 2;
            image(selection, mouseX, mouseY); //draw the selection
            pop();
        }
    }
    
    //resizeSelection() - based on the value passed - changes the size of the selection
    //according to the position of the mouse
    //parameters:
    //-knobActive - string value indicating which corner knob is being dragged
    this.resizeSelection = function(knobActive){
        this.applyBuffer(); //update canvas
        
        //set temporary coordinates
        let tempX = mouseX;
        let tempY = mouseY;
        //switch statement to resize the selection from the correct corner
        switch (knobActive){ 
            case "topLeft":
                //set width and height based on difference to mouse position
                //(var is used instead of let as let is block specific -
                //function specific required)
                if (mouseX < x1){
                    var rWidth = selection.width + (x1 - mouseX);  
                }
                else{
                    var rWidth = selection.width - (mouseX - x1);
                }
                if (mouseY < y1){
                    var rHeight = selection.height + (y1 - mouseY);  
                }
                else{
                    var rHeight = selection.height - (mouseY - y1);
                }
                if (rWidth === 0){
                    rWidth = 1;
                }
                if (rHeight === 0){
                    rHeight = 1;
                }
                push();
                imageMode(CORNER);
                image(selection, mouseX, mouseY, rWidth, rHeight);
                pop();
                break;
            case "topRight":
                if (mouseX < x1 + selection.width){
                    var rWidth = selection.width - ((x1 + selection.width) - mouseX); 
                }
                else{
                    var rWidth = selection.width + (mouseX - (x1 + selection.width));
                }
                if (mouseY < y1){
                    var rHeight = selection.height + (y1 - mouseY);
                }
                else{
                    var rHeight = selection.height - (mouseY - y1);
                }
                if (rWidth === 0){
                    rWidth = 1;
                }
                if (rHeight === 0){
                    rHeight = 1;
                }
                push();
                imageMode(CORNER);
                image(selection, mouseX - rWidth, mouseY, rWidth, rHeight);
                pop();
                tempX = mouseX - rWidth; //reset the top left corner X coord
                break;
            case "bottomLeft":
                if (mouseX < x1){
                    var rWidth = selection.width + (x1 - mouseX);  
                }
                else{
                    var rWidth = selection.width - (mouseX - x1);
                }
                if (mouseY < y1 + selection.height){
                    var rHeight = selection.height - ((y1 + selection.height) - mouseY);  
                }
                else{
                    var rHeight = selection.height + (mouseY - (y1 + selection.height));
                }
                if (rWidth === 0){
                    rWidth = 1;
                }
                if (rHeight  === 0){
                    rHeight = 1;
                }
                push();
                imageMode(CORNER);
                image(selection, mouseX, mouseY - rHeight, rWidth, rHeight);
                pop();
                tempY = mouseY - rHeight; //reset the top left corner Y coord
                break;
            case "bottomRight":
                if (mouseX < x1 + selection.width){
                    var rWidth = selection.width - ((x1 + selection.width) - mouseX); 
                }
                else{
                    var rWidth = selection.width + (mouseX - (x1 + selection.width));
                }
                if (mouseY < y1 + selection.height){
                    var rHeight = selection.height - ((y1 + selection.height) - mouseY);  
                }
                else{
                    var rHeight = selection.height + (mouseY - (y1 + selection.height));
                }
                if (rWidth === 0){
                    rWidth = 1;
                }
                if (rHeight === 0){
                    rHeight = 1;
                }
                push();
                imageMode(CORNER);
                image(selection, mouseX - rWidth, mouseY - rHeight, rWidth, rHeight);
                pop();
                //reset the x and y values of the top left corner
                tempX = mouseX - rWidth;
                tempY = mouseY - rHeight;
                break;
            default:
                break;
        }
        //ensure that the width and height are positive -
        //ensures that the top left is actually in the top left
        if (rWidth < 0){
            tempX += rWidth;
            rWidth *= -1;
        }
        if (rHeight < 0){
            tempY += rHeight;
            rHeight *= -1;
        }
        return [tempX, tempY, rWidth, rHeight]; //generate the new size of the selection
    }
    
    //deactivateSelection() - turns off the current selection so a new one can be made
    //returns: boolean value based on whether the mouse has been clicked to deactivate
    this.deactivateSelection = function(){
        if (!mouseClicked){
            this.selectionActive = false;
            originalX = -1;
            originalY = -1;
            prevMouseX = -1;
            prevMouseY = -1;
            draggingSelection = false;
            updatePixels();
            return true;
        }
        return false;
    }
    
    //resizeSelection() - draws the red box and corner knobs around the selection
    //parameters:
    //-x - x coord of top left corner
    //-y - y coord of top left corner
    //-w - width of selection box
    //-h - height of selection box
    this.drawSelectionBox = function(x, y, w, h){
        push();
        noFill();
        stroke(255, 0, 0);
        strokeWeight(0.5);
        rect(x, y, w, h);
        stroke(0);
        fill(255, 0, 0);
        circle(x, y, 5);
        circle(x, y + h, 5);
        circle(x + w, y, 5);
        circle(x + w, y + h, 5);
        pop();
    }
    
    //getSelection() - gets the image that can be moved as a selection
    //parameters:
    //-x - x coord of top left corner
    //-y - y coord of top left corner
    //-w - width of selection
    //-h - height of selection
    //returns: p5js image value based on the region specified
    this.getSelection = function(x, y, w, h){
        //if the width is negative - recalculate:
        if (w < 0){
            x = x + w;
            w = w * -1;
            originalX = x;
        }
        //if the height is negative - recalculate:
        if (h < 0){
            y = y + h;
            h = h * -1;
            originalY = y;
        }
        let selection = get(x, y, w, h);
        return selection;
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