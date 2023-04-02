function changeColor(className) {
    const color = style.getPropertyValue('--after');
    document.getElementById(className).style.color = color;   
}