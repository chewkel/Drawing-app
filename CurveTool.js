/*

Ben Craddock - 33733570 

*/

/*

-This function is designed to create a curve that can be drawn by dragging the mouse,
and then points on the curve can be edited dynamically by the user with their mouse.
-This function draws a rough trail of points as the user drags the
mouse across the canvas, and these points are then smoothened out into a curve, at
which point the original trail that was drawn is removed. Done for UX purposes
-Once the curve is drawn, equidistant points are shown by circles on the curve line
so that the user can click and drag these circles to re-arrange the points on the curve
-Once the user clicks outside any of these editable points, the curve is finalised and
drawn to the canvas in that state permanentely.

*/

//defines the constructor function for the curve tool.
function CurveTool(){
    //sets the icon for the tool - in this case it is specified by a string
    //value that points to an image path
	this.icon = "assets/curve.jpg";
    
	this.name = "curve"; //ensures that the curve tool object is valid by
                          //assigning an icon as well as a name.

    //negative initial start values are set so that the draw function can
    //check if the curve tool is being used and can therefore correctly
    //initialise the starting x and y positions to the current mouse positions.
	var startMouseX = -1;
	var startMouseY = -1;
    var previousMouseX = -1;
    var previousMouseY = -1;
    
    //this sets up empty arrays to store the points for the raw coordinate data as well
    //as the edited curve data
    var points = []; //array for raw coordinate data - logging every point the user draws
    
    /*
    curves - curve data is stored as follows:
    - curves[i] is the base curve. The holder for the curve data.
    - curves[i][j] is a single coordinate on that curve in the format [x, y] as an array
    - curves[i][j][k] is either the x or y value of the coordinate stored in curves[i][j]
    where 0 and 1 are the indicies for x and y respectively
    */
    
    var curves = []; //array to hold the base curve data:
    
    var currentCurve = []; //array to store the current curve being edited
    
    //variables used to handle the editable points: whether a curve is being edited as
    //well as which point.
    var editingCurve = false; //is the curve still being edited after being drawn?
    var editedPoint = null; //stores the point being edited
    var editingPoint = false; //stores whether or not a point is being edited

    //pixelRefresh() - called when a new curve is drawn: permanently draws the current
    //curve to the canvas
    this.pixelRefresh = function(){
        editingCurve = false;
        this.drawCurve(); //redraw the curve - prevents "cloning" the curve during drag
        this.curveRefresh();
    }
    
    //curveRefresh() - called after drawing a curve. Loads the pixel state.
    this.curveRefresh = function(){
        loadPixels();
        curves = []; //refresh the curves array to prevent an eventual stack overflow
    }
    
    //defines the drawing function for the curve tool
	this.draw = function(){
        //this executes when the mouse is clicked and a curve is not currently being edited
        if(mouseIsPressed && editingCurve == false){
            this.pixelRefresh();
            var trail = []; //empty array for the trail
            //curves should not start outside the canvas as these points are uneditable:
            //checks if within the bounds of the canvas or a curve is in progress:
            if (this.checkInCanvas() || points.length > 0){ 
                //check if they previousX and Y are -1. set them to the current
                //mouse X and Y if they are.
                if (previousMouseX == -1){
                    previousMouseX = mouseX;
                    previousMouseY = mouseY;
                }
                //if we already have values for previousX and Y they are pushed to the raw
                //point data array
                else{
                    previousMouseX = mouseX;
                    previousMouseY = mouseY;
                    //should the user drag their mouse off the canvas while drawing; this
                    //block of code snaps these points to the appropriate edge of the
                    //canvas - improves UX.
                    if (mouseX < 0){
                        previousMouseX = 0;
                    }
                    else if (mouseX > width){
                        previousMouseX = width;
                    }
                    if (mouseY > height){
                        previousMouseY = height;
                    }
                    else if (mouseY < 0){
                        previousMouseY = 0;
                    }
                    points.push([previousMouseX, previousMouseY]); //add the raw coords
                }
                
                //code for drawing the trail:
                //filters points to improve performance while preserving good UX
                for (var i = 0; i < points.length; i++){ 
                    if (i % 5 == 0){ //only adds every fifth point to the array
                        trail.push(points[i]);
                    }
                }
                //if there are minimum 2 points, draw lines between them:
                if (trail.length >= 2){ 
                    for (var i = 1; i < trail.length; i++){
                        line(trail[i-1][0], trail[i-1][1], trail[i][0], trail[i][1]);
                    }
                }
            }
		}
		//if the user has released the mouse we want to set the previousMouse values 
		//back to -1 - as well as begin the drawing process for the actual curve
		else{
            //the following executes if the trail is done being drawn:
            if (previousMouseX !== -1 && points.length > 10){
                curves.push(points); //add the raw coord data so it can be edited
                points = []; //refresh the points array so a new curve can be drawn
                editingCurve = true; //the curve is now in edit mode 
                
                //loop through the base curve:
                for (var j = 0; j < curves.length; j++){
                    var tempArray = []; //array to store every 10th point for smoothness
                    for (var i = 0; i < curves[j].length; i++){ //loop over coords
                        if (i % 10 == 0){ //push every tenth point
                            tempArray.push([curves[j][i][0], curves[j][i][1]]); 
                        }
                        //if the last point the mouse touched is not already in the
                        //array - it is now added manually - improves UX.
                        if (i == curves[j].length - 1 && (i % 10 !== 0)){
                            tempArray.push(
                                [
                                    curves[j][curves[j].length - 1][0],
                                    curves[j][curves[j].length - 1][1]
                                ]
                            );
                        }
                    }
                    //if there are more than two points to draw between, replace the raw
                    //point data with the new, filtered curve data
                    if (tempArray.length >= 2){
                        curves.splice(j, 1, tempArray);
                        this.drawCurve(); //draw the editable curve to the canvas
                    }
                    tempArray = []; //refresh the temporary array for the next curve
                }   
            }
            
            //original values are then reset once the curve is drawn for the first time
            points = [];
			previousMouseX = -1;
			previousMouseY = -1;
            
            this.changePoints(); //updates the curve points every frame
		}
	};
    
    //addPoints() - called to draw circles onto the line
    this.addPoints = function(){
        push(); //push the drawing state so the red stroke only affects the circles
        //loop over the curve and draw circles on each vertex
        for (var i = 0; i < currentCurve.length; i++){ 
            stroke(255, 0, 0);
            fill(0);
            circle(currentCurve[i][0], currentCurve[i][1], 15);
        }   
        pop();
    };
    
    //changePoints() - called to update the data when the user drags a vertex point
    this.changePoints = function(){
        //points can only be edited if the mouse is pressed:
        if (mouseIsPressed){
            //checks if a point is being edited so only one point gets dragged at a time
            if (editingPoint == false){ 
                for (var j = 0; j < currentCurve.length; j++){ //loop over the points
                    //if mouse is currently over a vertex: flag point for editing:
                    if (dist(mouseX, mouseY, currentCurve[j][0], currentCurve[j][1]) < 15){
                        editingPoint = true;
                        editedPoint = j;
                        editingCurve = true;
                        break; //break so as to only edit the point clicked
                    }
                    else{
                        editingCurve = false; 
                    }
                }
            }
        }
        else{
            editingPoint = false; //point is not being edited if mouse isn't pressed
        }
        if (editingPoint){ //if a point is being edited: update its position in curves
            currentCurve[editedPoint][0] = mouseX;
            currentCurve[editedPoint][1] = mouseY;
            currentCurve.splice(editedPoint, 1, [mouseX, mouseY]);
            curves.splice(curves.length - 1, 1, currentCurve);
            this.drawCurve(); //redraw the curve
        }
    }
    
    //drawCurve() - called when the line for the actual curve is to be drawn
    this.drawCurve = function(){
        updatePixels(); //load pixels[] to the canvas
        for (var j = 0; j < curves.length; j++){ //loop over curves
            for (var i = 0; i < curves[j].length; i++){
                currentCurve = curves[j]; //set current curve
                noFill();
                beginShape(); //start drawing the curve
                curveVertex(curves[j][0][0], curves[j][0][1]); //duplicate first vertex
                //loop over all verticies and add them to the shape:
                for (var i = 0; i < curves[j].length; i++){
                    curveVertex(curves[j][i][0], curves[j][i][1]);
                }
                curveVertex( //duplicate last vertex
                    curves[j][curves[j].length - 1][0],
                    curves[j][curves[j].length - 1][1]
                );
                endShape();
                //display circles if the curve has just been drawn
                if (editingCurve){
                    this.addPoints();
                }
            }
        }
    }
    
    //checkIncanvas() - called to check the position of the mouse when drawing curve;
    //returns true if the mouse is inside the canvas
    this.checkInCanvas = function(){
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
            return true;
        }
        return false;
    }
    //when the tool is deselected update the pixels to just show the drawing and
	//refresh the curve
	this.unselectTool = function() {
		updatePixels();
        this.curveRefresh();
	};
    
    //the clear button doesn't afffect the curves array directly. Therefore it must
    //be recalled manually in this constructor also.
    select("#clearButton").mouseClicked(function() { //manually reset curves after clear
        curves = [];
        loadPixels(); //load pixels to ensure correct pixels[] state
	});
}