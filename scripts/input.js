var dropdownMenu = document.querySelector('.dropdown-menu');

dropdownMenu.addEventListener('click', function(e) {
console.log('clicked');
  var target = e.target;
  if (target.tagName === 'A') {
    var inputField = document.querySelector('.dropdown-toggle');
    inputField.value = target.textContent.trim();
    var dropdown = new bootstrap.Dropdown(inputField);
    dropdown.hide();
  }
});
