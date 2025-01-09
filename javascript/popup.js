// This JavaScript file contains the logic for the website's popup buttons.

const popupBlur = document.getElementById('popup-blur');

// Opens the corresponding popup when clicking on any popup button.
document.querySelectorAll('.popup-button').forEach(button => {
    button.addEventListener('click', () => {
        let buttonClass = button.classList[1];
        document.querySelector(`.popup.${buttonClass}`).style.display = 'flex';
        popupBlur.style.display = 'flex';
    })
});

// Closes the popup when clicking outside of it.
popupBlur.addEventListener('click', () => {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    })
    popupBlur.style.display = 'none';
});
