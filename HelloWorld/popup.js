document.addEventListener('DOMContentLoaded', function() {
    var nameInput = document.getElementById('name');
    var greet = document.getElementById('greet');

    nameInput.addEventListener('keyup', function() {
        greet.textContent = 'Hello ' + nameInput.value + '!';
    });
});