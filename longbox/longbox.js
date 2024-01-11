const mysql = require('mysql');

// Database connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yourUsername',      // Replace with your MySQL username
    password: 'yourPassword',  // Replace with your MySQL password
    database: 'TestDB'         // Replace with your database name (schema)
});

// Function to add a card to the database
function addCard(collectorsNumber, cardName, color, manaCost, price) {
    const query = 'INSERT INTO cards (collectorsNumber, name, color, manaCost, price) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [collectorsNumber, cardName, color, manaCost, price], (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Card added: ${cardName}`);
    });
}

// Function to retrieve and sort cards
function getSortedCards(sortBy) {
    const query = `SELECT * FROM cards ORDER BY ${sortBy}`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Sorted Cards:', results);
    });
}

// Example GUI interactions (placeholders, not functional code)
console.log("Welcome to the Magic: The Gathering Card Organizer");
console.log("Options:");
console.log("1. Add a new card");
console.log("2. View and sort cards");
console.log("3. Duplicate certain cards into files");
console.log("4. Edit card files");
console.log("5. Delete card files");

// Uncomment and use these functions to interact with the database
// For example:
// addCard('123', 'Black Lotus', 'Black', '3', '20000');
// getSortedCards('name');

// Remember to open and close the database connection
connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database with ID ' + connection.threadId);

    // Call database interaction functions here
    // For testing, you can uncomment the example function calls above.

    // Close the connection when done
    // connection.end();
});

console.log("Please set up your database and uncomment the relevant sections to enable full functionality.");
