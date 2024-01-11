const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'TestDB'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database with ID ' + connection.threadId);
});

app.post('/addcard', (req, res) => {
    const { collectorsNumber, cardName, color, manaCost } = req.body; // Remove price from here
    const query = 'INSERT INTO cards (collectorsNumber, name, color, manaCost) VALUES (?, ?, ?, ?)'; // Remove price from the query
    
    // Continue with the insertion without 'price' field

    connection.query(query, [collectorsNumber, cardName, color, manaCost], (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Card added: ${cardName}`);
        
        // Simulate fetching the price from the database (replace with actual database query)
        const priceFromDatabase = "10.00"; // Replace with price retrieval logic

        // Construct the table row with the retrieved price
        const newRow = `
            <tr>
                <td>${collectorsNumber}</td>
                <td>${cardName}</td>
                <td>${color}</td>
                <td>${manaCost}</td>
                <td>${priceFromDatabase}</td> <!-- Display the price from the database -->
            </tr>
        `;

        res.redirect('/'); // Redirect back to the main page after adding card
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Ex: GUI interactions (placeholders, not functional code)
console.log("Welcome to the Magic: The Gathering Card Organizer");
console.log("Options:");
console.log("1. Add a new card");
console.log("2. View and sort cards");
console.log("3. Duplicate certain cards into files");
console.log("4. Edit card files");
console.log("5. Delete card files");

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
