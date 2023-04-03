let slides = document.querySelectorAll('.slide');
let buttons = document.querySelectorAll('.btn');
let currentSlide = 1;

// Javascript for image slider manual navigation through clicks
let manualNav = function(manual){
    slides.forEach((slide) => {
    slide.classList.remove('active');

    buttons.forEach((button) => {
        button.classList.remove('active');
    });
    });

    slides[manual].classList.add('active');
    buttons[manual].classList.add('active');
}

buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
    manualNav(i);
    currentSlide = i;
    });
});