// select the hamburger element in your HTML ( the menu icon for mobile view)
let hamburgerContainer = document.querySelector('.hamburger');

// select the dropdown box element ( the mobile menu that appears when the hamburger is clicked)
let dropdownBox = document.getElementById('dropdownBox');

// select the exit icon element ( used to close the mobile menu)
 exitIcon = document.getElementById('exitIcon');

// select all anchor tags inside list itema in the mobile navigation container
let allAnchorTags = document.querySelectorAll('#navcon-mobile li a');


// check if the hamburger container element exists in the DOM
if (hamburgerContainer) {
    // add click event listener to the hamburger container
    hamburgerContainer.addEventListener('click', function(){
        // show the dropdown box ( mobile menu) and apply animation
        dropdownBox.style.display = 'flex';
        dropdownBox.classList.add('animate__rollIn')
    })
}

// check if the exit icon exists in the DOM
if (exitIcon) {
    // add click event listener to the exit icon
    exitIcon.addEventListener('click', function() {
        // hide the dropdown box ( close the mobile menu) and remove animation
        dropdownBox.style.display = 'none';
        dropdownBox.classList.remove('animate__rollIn');
    })
};


// check if there are anchor tags inside the mobile navigation container 
if(allAnchorTags){
    // loop through all anchor tags and add event listener to each one
    allAnchorTags.forEach(allAnchorTag => {
        allAnchorTag.addEventListener('click', function(){
             // hide the dropdown box when an anchor tag is clicked ( close the menu)
        dropdownBox.style.display = 'none';
        })
    })
};

let spanBoxs = document.querySelectorAll('#accordion_head span')

spanBoxs.forEach(spanBox => {
    spanBox.addEventListener('click', function(){
        let spanBoxparent = this.parentElement;
        let accordionHeadParent = spanBoxparent.parentElement;
        accordionHeadParent.children[1].classList.toggle('active');
        
    })
});

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var sliderRoot = document.querySelector('.my-testimonial-slider');
    if (!sliderRoot) {
      return;
    }

    var slidesContainer = sliderRoot.querySelector('.mts-slides');
    var slides = Array.prototype.slice.call(
      sliderRoot.querySelectorAll('.mts-slide')
    );
    var prevBtn = sliderRoot.querySelector('.mts-control-prev');
    var nextBtn = sliderRoot.querySelector('.mts-control-next');
    var currentIndex = 0;
    var total = slides.length;

    function goToIndex(index) {
      if (index < 0) {
        index = total - 1;
      } else if (index >= total) {
        index = 0;
      }
      currentIndex = index;
      var offsetPercent = -currentIndex * 100;
      slidesContainer.style.transform = 'translateX(' + offsetPercent + '%)';
    }

    function onPrevClick(evt) {
      evt.preventDefault();
      goToIndex(currentIndex - 1);
    }

    function onNextClick(evt) {
      evt.preventDefault();
      goToIndex(currentIndex + 1);
    }

    prevBtn.addEventListener('click', onPrevClick);
    nextBtn.addEventListener('click', onNextClick);

    // Initialize position
    goToIndex(0);
  });
})();