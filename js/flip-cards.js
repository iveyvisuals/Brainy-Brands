(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('.dt-flip'), function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) { return; }
      card.classList.toggle('is-flipped');
    });
  });
})();
