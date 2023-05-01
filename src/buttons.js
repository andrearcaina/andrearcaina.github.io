function changeColor() {
    const button = document.getElementById('color-button');
    const spans = document.querySelectorAll('.green');
    const icons = document.querySelectorAll('.slow-bounce');
    
    const here = document.getElementById('here');

    const body = document.getElementsByTagName('body')[0];
    const bodyStyle = getComputedStyle(body);
    const backgroundColor = bodyStyle.backgroundColor;

    if (backgroundColor === 'rgb(146, 168, 209)') {
        body.style.backgroundColor = 'rgb(44, 88, 168)';
        body.style.color = 'white';
        here.style.color = 'white';
        button.style.backgroundColor = 'rgb(146, 168, 209)';
        button.style.color = 'rgb(44, 88, 168)';
        button.innerHTML = 'light';
        
        spans.forEach(span => {
            span.style.color = 'rgb(76,175,80)';
        });

        icons.forEach(icon => {
            icon.style.color = 'rgb(127, 127, 214)';
            icon.onmouseout = () => {
                icon.style.color = 'rgb(127, 127, 214)';
            }
            icon.onmouseover = () => {
                icon.style.color = 'rgb(76,175,80)';
            }
        });
    }
    else {
        body.style.backgroundColor = 'rgb(146, 168, 209)';
        body.style.color = 'black';
        here.style.color = 'black';
        button.style.backgroundColor = 'rgb(44, 88, 168)';
        button.style.color = 'rgb(146, 168, 209)';
        button.innerHTML = 'dark';
        
        spans.forEach(span => {
            span.style.color = 'rgb(40, 167, 69)';
        });
    
        icons.forEach(icon => {
            icon.style.color = 'rgb(74, 74, 167)';
            icon.onmouseout = () => {
                icon.style.color = 'rgb(74, 74, 167)';
            }
            icon.onmouseover = () => {
                icon.style.color = 'rgb(40, 167, 69)';
            }
        });
    }
}

function scrollToRight() {
    let aboutMe = document.getElementById('about-info');
    let contact = document.getElementById('contact-info');
    let projects = document.getElementById('projects');
    aboutMe.style.transform = 'translateX(-400%)';
    contact.style.transform = 'translateX(-400%)';
    projects.style.transform = 'translateX(0%)';
}

function scrollToLeft() {
    let aboutMe = document.getElementById('about-info');
    let contact = document.getElementById('contact-info');
    let projects = document.getElementById('projects');
    aboutMe.style.transform = 'translateX(0%)';
    contact.style.transform = 'translateX(0%)';
    projects.style.transform = 'translateX(500%)';
}