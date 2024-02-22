
if (firebase.apps.length === 0) {
    alert("Firebase is not initialized.");
  } else {
    alert("Firebase is initialized.");
  }
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

// old way to get uid
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

// User authenitcation error when leaving page
// Listen for authentication state changes
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        console.log("User signed in:", user);
        // You can call the addCard function here if you want to ensure the user is authenticated before adding a card
    } else {
        // User is signed out.
        console.log("User signed out.");
    }
});

function addCard(selectedCardName) {
    // Validate input value
    if (!selectedCardName) {
        alert("Please enter a card name.");
        return;
    }

    // Function to capitalize the first letter of each word
    const capitalizeFirstLetter = (string) => {
        // complicated stuff just makes sure it recognizes and leaves rest alone around whitespace
        return string.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
            return char.toUpperCase();
        });
    };

    // Convert selectedCardName to lowercase and capitalize the first letter of each word
    const formattedCardName = selectedCardName
        .toLowerCase()
        .split(' ')
        .map(word => {
            const lowerCaseWords = ['a', 'the', 'and', 'of']; // Words to keep lowercase could cause issues
            return lowerCaseWords.includes(word) ? word : capitalizeFirstLetter(word);
        })
        .join(' ');

    // Get the currently authenticated user for testing
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('User not authenticated.');
        return;
    }

    // Reference to the Realtime Database
    const dbRef = firebase.database().ref(); // Root reference

    // Get the first letter of the card name to fit file structure
    const firstLetter = formattedCardName.charAt(0).toLowerCase();

    // Reference to the specific card in the Realtime Database
    const cardRef = dbRef.child("mtg_names").child(firstLetter).child("cards").child(formattedCardName);

    // Retrieve the card data
    cardRef.once('value')
        .then(snapshot => {
            const cardData = snapshot.val();
            console.log("Card Data:", cardData); // Log card data to console for debugging

            if (cardData) {
                // for testing to see what pops up
                console.log("Card Name:", cardData.name);
                console.log("Color:", cardData.color);
                console.log("Converted Mana Cost:", cardData.converted_mana_cost);
                console.log("ID:", cardData.id);
                console.log("Mana Cost:", cardData.mana_cost);
                console.log("Amount of Colors:", cardData.amount_of_colors);

                // Reference to Firestore
                const db = firebase.firestore();

                // Reference to the specific collection in Firestore
                const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");
                
                // Add the card to the user's collection
                userCardsRef.add({
                    cardName: formattedCardName, // Use the formatted card name
                    color: cardData.color,
                    convertedManaCost: cardData.converted_mana_cost,
                    id: cardData.id,
                    manaCost: cardData.mana_cost,
                    amountOfColors: cardData.amount_of_colors
                    // Add other card details as needed
                })
                    .then((docRef) => {
                        // Get the URL of the added document in Firestore
                        alert("Card added successfully at: " + docRef.path);
                    })
                    .catch(error => {
                        console.error('Error adding card:', error);
                        alert('Failed to add card.');
                    });
                    
                alert("Added card data to Firestore. Check console for details.");
            } else {
                alert('Card not found.');
            }
        })
        .catch(error => {
            console.error('Error getting card:', error);
            alert('Failed to get card data.');
        });

    // Alert to indicate function execution
    alert("Function execution complete. Check console for details.");
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


