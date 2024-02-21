// Utility Functions
function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
}

function showLoginForm() {
    const loginForm = document.getElementById("loginForm");
    loginForm.style.display = "block";
}

function loginFormDisplay() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // close the login form
    const loginForm = document.getElementById("loginForm");
    loginForm.style.display = "none";
}

function login() {
    // Logic to handle login, currently hides the login form
    document.getElementById("loginForm").style.display = "none";
}

// Card Management Functions
function addCard() {
    const collectorsNumber = document.getElementById('collectorsNumber').value;
    const cardName = document.getElementById('cardName').value;
    const color = document.getElementById('color').value;
    const manaCost = document.getElementById('manaCost').value;
    const cardList = document.getElementById('cardList');
    if (/^\d+$/.test(collectorsNumber)) {
        // Convert the string to an integer
        var intValue = parseInt(collectorsNumber);
    
        // Check if the parsed value is an integer
        if (Number.isInteger(intValue)) {
            // Create a new table row and cells
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${cardName}</td>
            <td>${collectorsNumber}</td>
            <td>${color}</td>
            <td>${manaCost}</td>
        `;
            // Append the new row to the card list
            cardList.appendChild(newRow);

            // Clear input fields
            document.getElementById('collectorsNumber').value = '';
            document.getElementById('cardName').value = '';
            document.getElementById('color').selectedIndex = 0;
            document.getElementById('manaCost').value = '';
    }
}
    else {
        alert("Please enter a valid Collector's Number with only numbers.");
        collectorsNumberInput.classList.add('error');
        collectorsNumberInput.value = ''; // Clear input
        return false
    }

    
}

function removeSelectedCards() {
    const checkboxes = document.querySelectorAll("#cardList input[type='checkbox']:checked");
    checkboxes.forEach(checkbox => checkbox.closest("tr").remove());
}

// Folder Management Functions
function addFolder() {
    const folderNameInput = document.getElementById('folderName');
    const folderName = folderNameInput.value.trim();
    const folderList = document.getElementById('folderList');

    if (!folderName) {
        alert('Please enter a folder name.');
        return;
    }
    const folderNameList = document.createElement('tr');
            folderNameList.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${folderName}</td>
        `;
    folderList.appendChild(folderNameList);

    folderNameInput.value = ''; // Clear the input field
}
function addToFolder(){
    const cardName = document.getElementById('cardName');
    const folderName = document.getElementById('folderName');
    const folderList = document.getElementById('folderList');
    const checkboxes = document.querySelectorAll("#folderList input[type='checkbox']:checked");
    const cardsChecked = document.querySelectorAll("#cardList input[type='checkbox']:checked");

        if (folderName) {
            checkboxes.forEach(function(checkbox) {
                cardsChecked.forEach(function(cardChecked) {
                    const cardRow = document.createElement('tr');
                    cardRow.innerHTML = `<td>${cardName.value}</td>`;
                    folderList.appendChild(cardRow);
                });
            });
        }

}
// Initialization Functions
function initializeEventListeners() {
    const addButton = document.getElementById('addCardForm').querySelector('button');
    addButton.onclick = function() {
        addCard();
    };

    document.getElementById('removeCardsButton').onclick = removeSelectedCards;
    document.getElementById('addToFolderButton').onclick = addToFolder;
}

// Call initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
