const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function validateCollectorNumber() {
    const collectorsNumberInput = document.getElementById('collectorsNumber');
    const collectorsNumber = collectorsNumberInput.value;

    // Check to make sure input is only numbers
    const validInput = /^[0-9]+$/.test(collectorsNumber);

    if (!validInput) {
        alert("Please enter a valid Collector's Number with only numbers.");
        collectorsNumberInput.value = ''; // Clear input
    }
}

// Function to create a new folder
function createFolder() {
    const folderName = document.getElementById('folderName').value;
    
    // Check if folderName is not empty
    if (folderName.trim() === '') {
        alert('Please enter a folder name.');
        return;
    }

    // Create a new folder list item
    const folderListItem = document.createElement('li');
    folderListItem.textContent = folderName;

    // Append the folder list item to the folder list
    const folderList = document.getElementById('folderList');
    folderList.appendChild(folderListItem);

    // Clear the folder name input field
    document.getElementById('folderName').value = '';
}

function addCard() {
    const collectorsNumber = document.getElementById('collectorsNumber').value;
    const cardName = document.getElementById('cardName').value;
    const color = document.getElementById('color').value;
    const manaCost = document.getElementById('manaCost').value;

    // Create a new table row
    const newRow = document.createElement('tr');

    // Create a checkbox cell
    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkboxCell.appendChild(checkbox);

    // Create table data cells for each column
    const collectorsNumberCell = document.createElement('td');
    collectorsNumberCell.textContent = collectorsNumber;

    const cardNameCell = document.createElement('td');
    cardNameCell.textContent = cardName;

    const colorCell = document.createElement('td');
    colorCell.textContent = color;

    const manaCostCell = document.createElement('td');
    manaCostCell.textContent = manaCost;

    // Append the cells to the new row
    newRow.appendChild(checkboxCell);
    newRow.appendChild(cardNameCell);
    newRow.appendChild(collectorsNumberCell);
    newRow.appendChild(colorCell);
    newRow.appendChild(manaCostCell);

    // Get the table body and append the new row
    const cardList = document.getElementById('cardList');
    cardList.appendChild(newRow);

    // Clear input fields
    document.getElementById('collectorsNumber').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('color').selectedIndex = 0; // Reset the color dropdown to its default option
    document.getElementById('manaCost').value = '';
}
// Add listeners for checkbox changes
const checkboxes = document.querySelectorAll("input[type='checkbox']");
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange);
});

// Function to handle checkbox changes
function handleCheckboxChange() {
    const cardList = document.getElementById("cardList");
    const checkboxes = cardList.querySelectorAll("input[type='checkbox']");
    const removeCardsButton = document.getElementById("removeCardsButton");

    let atLeastOneSelected = false;

    // Check if at least one checkbox is selected
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            atLeastOneSelected = true;
        }
    });

    // Show/hide the Remove Cards button based on selection
    if (atLeastOneSelected) {
        removeCardsButton.style.display = "block";
    } else {
        removeCardsButton.style.display = "none";
    }
}

function addFolder() {
    const folderName = document.getElementById('folderName').value.trim();

    if (folderName === '') {
        alert('Please enter a folder name.');
        return;
    }

    const folderList = document.getElementById('folderList');
    const folderItem = document.createElement('li');
    folderItem.textContent = folderName;
    folderList.appendChild(folderItem);

    // Clear the input field
    document.getElementById('folderName').value = '';
}

function removeSelectedCards() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const cardList = document.getElementById("cardList");

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const row = checkbox.closest("tr");
            cardList.removeChild(row);
        }
    });
}

function addToFolder() {
    alert("Add logic to put cards into folder");
}