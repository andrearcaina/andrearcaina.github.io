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
