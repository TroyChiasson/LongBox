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

    // Get the table body and append the new row
    const cardList = document.getElementById('cardList');
    const newRow = cardList.insertRow();

    // Create table data cells for each column
    const cardNameCell = newRow.insertCell(0);
    cardNameCell.textContent = cardName;

    const collectorsNumberCell = newRow.insertCell(1);
    collectorsNumberCell.textContent = collectorsNumber;

    const colorCell = newRow.insertCell(2);
    colorCell.textContent = color;

    const manaCostCell = newRow.insertCell(3);
    manaCostCell.textContent = manaCost;

    // Clear input fields
    document.getElementById('collectorsNumber').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('color').selectedIndex = 0;
    document.getElementById('manaCost').value = '';
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
