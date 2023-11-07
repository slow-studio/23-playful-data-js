shapes = [
        '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect class="cls-1" x="0.5" y="34.5" width="99" height="30"/></svg>', 
        '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect class="cls-1" x="0.5" y="23.5" width="99" height="50"/></svg>' ,
        '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect class="cls-1" x="0.5" y="13.5" width="99" height="70"/></svg>' , 
        '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect class="cls-1" x="0.5" y="3.5" width="99" height="90"/></svg>'
        ]

shape = 0
direction = 1
changeShape()
function changeShape()
{
if((shape == 0) || (shape == shapes.length - 1))
    direction = direction * -1
shape = shape + (direction * -1)
console.log (shape)
document.getElementById("svg").innerHTML = shapes[shape]
}