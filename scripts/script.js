function changeColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    
    const button = document.getElementById('button');
    button.style.backgroundColor = "rgb(" + red + ", " + green + ", " + blue + ")";

    //let color = "rgb(" + red + ", " + green + ", " + blue + ")";
    //document.body.style.background = color;

}

