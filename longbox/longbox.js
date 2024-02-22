
if (firebase.apps.length === 0) {
    alert("Firebase is not initialized.");
  } else {
    alert("Firebase is initialized.")
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

                        // Update the Card List table with the new card
                        const cardList = document.getElementById('cardList');
                        const newRow = cardList.insertRow();

                        // Create a checkbox in the first cell
                        const checkboxCell = newRow.insertCell(0);
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkboxCell.appendChild(checkbox);

                        // Fill in the rest of the cells with card details
                        const cell1 = newRow.insertCell(1);
                        const cell2 = newRow.insertCell(2);
                        const cell3 = newRow.insertCell(3);
                        const cell4 = newRow.insertCell(4);

                        cell1.innerHTML = formattedCardName; // Set the card name
                        cell2.innerHTML = cardData.color; // Set the color
                        cell3.innerHTML = cardData.converted_mana_cost; // Set the converted mana cost
                        cell4.innerHTML = ""; // Set the price or add price calculation if needed
                    })
                    .catch(error => {
                        console.error('Error adding card:', error);
                        alert('Failed to add card.');
                    });
            } else {
                alert('Card not found.');
            }
        })
        .catch(error => {
            console.error('Error getting card:', error);
            alert('Failed to get card data.');
        });
}



// Function to remove selected cards from UI and Firestore
function removeSelectedCards() {
    const checkboxes = document.querySelectorAll("#cardList input[type='checkbox']:checked");
    
    // Check if any card is selected
    if (checkboxes.length === 0) {
        alert('Please select at least one card to remove.');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    // Check if user is authenticated
    if (!user) {
        alert('User not authenticated.');
        return;
    }

    // Loop through each selected card checkbox
    checkboxes.forEach(checkbox => {
        const cardName = checkbox.closest("tr").querySelector("td:nth-child(2)").textContent;
        
        // Reference to the specific collection in Firestore for user's cards
        const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

        // Query for the card to be deleted
        userCardsRef.where("cardName", "==", cardName)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    // Delete the card document from Firestore
                    doc.ref.delete().then(() => {
                        console.log("Card successfully deleted from Firestore!");
                    }).catch(error => {
                        console.error("Error removing card from Firestore: ", error);
                        alert('Failed to remove card from Firestore.');
                    });
                });
            })
            .catch(error => {
                console.error("Error querying card for deletion: ", error);
                alert('Failed to remove card from Firestore.');
            });

        // Remove the card row from the UI
        checkbox.closest("tr").remove();
    });

    alert('Selected card(s) removed successfully.');
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

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('User not authenticated.');
        return;
    }

    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    // Create a new document with the folder name
    foldersRef.doc(folderName).set({})
        .then(() => {
            alert(`Folder '${folderName}' added successfully.`);
            
            // Add the folder name to the UI
            const folderRow = document.createElement('tr');
            folderRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${folderName}</td>
            `;
            folderList.appendChild(folderRow);
            
            folderNameInput.value = ''; // Clear the input field
        })
        .catch(error => {
            console.error('Error adding folder:', error);
            alert('Failed to add folder.');
        });
}

function addToFolder(){
    const cardName = document.getElementById('cardName').value;
    const folderList = document.getElementById('folderList');
    const folderCheckboxes = document.querySelectorAll("#folderList input[type='checkbox']:checked");
    const cardsChecked = document.querySelectorAll("#cardList input[type='checkbox']:checked");

    if (folderCheckboxes.length === 0) {
        alert('Please select at least one folder.');
        return;
    }

    if (cardsChecked.length === 0) {
        alert('Please select at least one card to add to the folder(s).');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('User not authenticated.');
        return;
    }

    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    // Loop through each selected folder checkbox
    folderCheckboxes.forEach(function(folderCheckbox) {
        const folderName = folderCheckbox.closest("tr").querySelector("td:nth-child(2)").textContent;

        // Create a reference to the folder's document
        const folderDocRef = foldersRef.doc(folderName);

        // Loop through each selected card checkbox
        cardsChecked.forEach(function(cardChecked) {
            const cardName = cardChecked.closest("tr").querySelector("td:nth-child(2)").textContent;

            // Reference to the specific collection in Firestore for cards in this folder
            const folderCardsRef = folderDocRef.collection("cards");

            // Add the card to the folder's collection
            folderCardsRef.add({
                cardName: cardName,
                // You can add other details here if needed
            })
            .then((docRef) => {
                console.log("Card added to folder:", folderName, "Card Name:", cardName);
                // You might want to update the UI to reflect the card being added to the folder
            })
            .catch(error => {
                console.error('Error adding card to folder:', error);
                alert('Failed to add card to folder.');
            });
        });
    });

    // Clear the checked cards after adding them to folders
    cardsChecked.forEach(function(cardChecked) {
        cardChecked.checked = false;
    });

    alert('Card(s) added to selected folder(s) successfully.');
}


// work in progress need persistence to work
function getCardsFromFirestore() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        persistence: true
      });


    const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

    userCardsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            // Use the retrieved data here (e.g., display it on the UI)
        });
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
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


