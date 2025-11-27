// select all elements with the class 'slide'
let slides = document.querySelectorAll('.auto');

// select the 'next' button by its id
let nextBtn = document.querySelector('#forth');

// select the 'previous' button by its id
let prevBtn = document.querySelector('#back');

// initialize the slide index to 0
let num = 0;

// funtion to manipulate slide
function next() {
    // if the current slide exceeds the total number of slides, reset to the first slide
    if (num > slides.length - 1) {
    num = 0;
     }

// loop through all slides and hide them
for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none'; // hide all slides
}
    slides[num].style.display = 'block'; // display the current slide

    // increment the slide index to move to the next slide
    num++;
}


// call the next function to display the first slide initially
next();

// automatically call the next function every 5 seconds when the page loads
window.addEventListener('load', function () {
    setInterval(next, 5000);
});

// add an event listener to the 'next' button to call the funtion when clicked 
nextBtn.addEventListener('click', next);

// funtion to display the previous slide 
function Prev() {
    // decrease the slide index to move to the previous slide
    num--;

    // if the current slide index is less than 0, reset to the last slide
    if (num < 0) {
        num = slides.length - 1;
    }

    // loop through all the slides and hide them 
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none'; // hide all slides
    }
    slides[num].style.display = 'block'; // display the current slide
}

// add an event listener to the 'previous' button to call the prev funtion when clicked
prevBtn.addEventListener('click', Prev);