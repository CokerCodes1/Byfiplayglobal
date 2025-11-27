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