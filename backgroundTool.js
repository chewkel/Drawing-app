const colorInput = document.getElementById("color"); // get the color input element
console.log(colorInput.value); // get the value of the color input element

const init = () => {
  colorInput.value = "#ffffff"; // set the default color to white
};

function backgroundC() {
  select("#color").mouseClicked(function () {
    // when the color input element is clicked
    background(colorInput.value); // set the background to the color input element's value
    loadPixels();
    updatePixels(); 
  });
  
}

window.onload = init(); // run the init function when the window loads
