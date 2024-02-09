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
    if (Number.isInteger(parseInt(collectorsNumber))){
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

    if (!folderName) {
        alert('Please enter a folder name.');
        return;
    }

    const folderList = document.getElementById('folderList');
    const folderItem = document.createElement('li');
    folderItem.textContent = folderName;
    folderList.appendChild(folderItem);

    folderNameInput.value = ''; // Clear the input field
}

// Initialization Functions
function initializeEventListeners() {
    const addButton = document.getElementById('addCardForm').querySelector('button');
    addButton.onclick = function() {
        addCard();
    };

    document.getElementById('removeCardsButton').onclick = removeSelectedCards;
    document.getElementById('addToFolderButton').onclick = function() {
        alert("Add logic to put cards into folder");
    };
}

// Call initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
