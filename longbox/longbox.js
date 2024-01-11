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

function addCard() {
    const collectorsNumber = document.getElementById('collectorsNumber').value;
    const cardName = document.getElementById('cardName').value;
    const color = document.getElementById('color').value;
    const manaCost = document.getElementById('manaCost').value;

    // Create a new table row
    const newRow = document.createElement('tr');

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
