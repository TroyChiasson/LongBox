
if (firebase.apps.length === 0) {
    // alert("Firebase is not initialized.");
  } else {
    // alert("Firebase is initialized.")
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


/// Check authentication state and call function to restore cards in list
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user);
        getCardsFromFirestore();
        getFoldersFromFirestore();
    } else {
        console.log('User not signed in.');
    }
});

function addCard(selectedCardName) {
    // Validate input value
    if (!selectedCardName) {
        // alert("Please enter a card name.");
        return;
    }

    // Function to capitalize the first letter of each word
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Convert selectedCardName to lowercase and capitalize each word except specified articles
    const formattedCardName = selectedCardName
        .toLowerCase()
        .split(' ')
        .map(word => {
            const articles = ['a', 'the', 'and', 'of']; // Articles to keep lowercase
            return articles.includes(word) ? word : capitalizeFirstLetter(word);
        })
        .join(' ');

    // Get the currently authenticated user for testing
    const user = firebase.auth().currentUser;
    if (!user) {
        // alert('User not authenticated.');
        return;
    }

    // Reference to the Realtime Database
    const dbRef = firebase.database().ref(); // Root reference

    // Get the first letter of the card name to fit file structure
    const firstLetter = formattedCardName.charAt(0).toLowerCase();

    const cardName = formattedCardName
        .replace(".", " ")
        .replace("?", "_")
        .replace("!", "_")
        .replace("/", "-")
        .replace("#", "-");
    console.log(cardName)

    const cardRef = dbRef
        .child("mtg_names")
        .child(firstLetter)
        .child("cards")
        .child(cardName);

    // Retrieve the first card data using snapshot from firebase
    cardRef.once('value')
        .then(snapshot => {
            // Iterate through the children and select the first one
            let firstChildKey;
            snapshot.forEach(childSnapshot => {
                firstChildKey = childSnapshot.key;
                return true; // Exit loop after the first child
            });

            // Get the data of the first child
            const firstChildData = snapshot.child(firstChildKey).val();
            console.log("First Child Data:", firstChildData);

            // Reference to Firestore
            const db = firebase.firestore();

            // Reference to the specific collection in Firestore
            const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");
                
            // Add the card to the user's collection
            userCardsRef.add({
                name: firstChildData.name,
                set_code: firstChildData.set_code,
                collector_number: firstChildData.collector_number,
                color_identity: firstChildData.color_identity,
                colors: firstChildData.colors,
                converted_mana_cost: firstChildData.converted_mana_cost,
                id: firstChildData.id,
                mana_cost: firstChildData.mana_cost,
                prices: firstChildData.prices,
                type_of_card: firstChildData.type_of_card
                // Add more fields as needed
            })
            .then((docRef) => {
                // alert("Card added successfully at: " + docRef.path);

                const inputBox = document.getElementById('cardName');
                inputBox.value = ''; // Clear the input box after successful addition

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

                cell1.innerHTML = firstChildData.name; // Set the card name
                cell2.innerHTML = firstChildData.color_identity.join(', '); // Set the color identity
                cell3.innerHTML = firstChildData.converted_mana_cost; // Set the converted mana cost
                cell4.innerHTML = firstChildData.prices.usd_foil ? firstChildData.prices.usd_foil : firstChildData.prices.usd;

            })
            .catch(error => {
                console.error('Error adding card:', error);
                // alert('Failed to add card.');
            });
        })
        .catch(error => {
            console.error('Error getting card:', error);
            // alert('Failed to get card data.');
        });

    // Call displayCardList function

}




// Function to remove selected cards from UI and Firestore
function removeSelectedCards() {
    const checkboxes = document.querySelectorAll("#cardList input[type='checkbox']:checked");
    
    // Check if any card is selected
    if (checkboxes.length === 0) {
        // alert('Please select at least one card to remove.');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    // Check if user is authenticated
    if (!user) {
        // alert('User not authenticated.');
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
                        // alert('Failed to remove card from Firestore.');
                    });
                });
            })
            .catch(error => {
                console.error("Error querying card for deletion: ", error);
                // alert('Failed to remove card from Firestore.');
            });

        // Remove the card row from the UI
        checkbox.closest("tr").remove();
    });

    // alert('Selected card(s) removed successfully.');
}


// Folder Management Functions
function addFolder() {
    const folderNameInput = document.getElementById('folderName');
    const folderName = folderNameInput.value.trim();
    const folderList = document.getElementById('folderList');

    if (!folderName) {
        // alert('Please enter a folder name.');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        // alert('User not authenticated.');
        return;
    }

    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    // Create a new document with the folder name
    foldersRef.doc(folderName).set({})
        .then(() => {
            // alert(`Folder '${folderName}' added successfully.`);
            
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
            // alert('Failed to add folder.');
        });
}

function addToFolder(){
    const cardName = document.getElementById('cardName').value;
    const folderList = document.getElementById('folderList');
    const folderCheckboxes = document.querySelectorAll("#folderList input[type='checkbox']:checked");
    const cardsChecked = document.querySelectorAll("#cardList input[type='checkbox']:checked");

    if (folderCheckboxes.length === 0) {
        // alert('Please select at least one folder.');
        return;
    }

    if (cardsChecked.length === 0) {
        // alert('Please select at least one card to add to the folder(s).');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        // alert('User not authenticated.');
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
                // alert('Failed to add card to folder.');
            });
        });
    });

    // Clear the checked cards after adding them to folders
    cardsChecked.forEach(function(cardChecked) {
        cardChecked.checked = false;
    });

    // alert('Card(s) added to selected folder(s) successfully.');
}

// seems they are not actually authenticated even tho they are signed in
// work in progress need persistence to work
function getCardsFromFirestore() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        // alert('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

    userCardsRef.get().then((querySnapshot) => {
        const cardList = document.getElementById('cardList');

        // Clear existing card list before populating again
        cardList.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const cardData = doc.data();

            // Create a new row for each card
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

            cell1.innerHTML = cardData.name;
            cell2.innerHTML = cardData.colors;
            cell3.innerHTML = cardData.converted_mana_cost;
            cell4.innerHTML = cardData.prices.usd_foil ? cardData.prices.usd_foil : cardData.prices.usd;
 // You can add other details or calculations here if needed
        });
    }).catch((error) => {
        console.error("Error getting documents: ", error);
        // alert('Failed to retrieve cards from Firestore.');
    });
}

function getFoldersFromFirestore() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        // alert('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    foldersRef.get().then((querySnapshot) => {
        const folderList = document.getElementById('folderList');

        // Clear existing folder list before populating again
        folderList.innerHTML = '';

        querySnapshot.forEach((doc) => {
            // Use the document ID as the folder name
            const folderName = doc.id.replace(/_/g, ' '); // Replace underscores with spaces

            // Create a new row for each folder
            const newRow = folderList.insertRow();

            // Create a checkbox in the first cell
            const checkboxCell = newRow.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkboxCell.appendChild(checkbox);

            // Fill in the rest of the cells with folder details
            const cell1 = newRow.insertCell(1);
            cell1.innerHTML = folderName;

            // You can add more cells for additional folder details if needed
        });
    }).catch((error) => {
        console.error("Error getting folders: ", error);
        // alert('Failed to retrieve folders from Firestore.');
    });
}



function displaySortedCards(sortBy) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

    let query;
    if (sortBy === 'highestMana') {
        query = userCardsRef.orderBy('converted_mana_cost', 'desc');
    } else if (sortBy === 'lowestMana') {
        query = userCardsRef.orderBy('converted_mana_cost', 'asc');
    } else {
        // Default sorting by name
        query = userCardsRef.orderBy('name');
    }

    const cardList = document.getElementById('cardTable');
    if (!cardList) {
        console.log('Card list element not found.');
        return;
    }

    // Create tbody if it doesn't exist
    let tbody = cardList.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        cardList.appendChild(tbody);
    } else {
        // Clear existing rows from the table
        tbody.innerHTML = '';
    }

    query.get().then((querySnapshot) => {
        const sortedCards = [];
        querySnapshot.forEach((doc) => {
            const cardData = doc.data();

            // Calculate the price to display (the higher of usd and usd_foil)
            let displayPrice = 'N/A';
            if (cardData.prices && (cardData.prices.usd || cardData.prices.usd_foil)) {
                const usd = parseFloat(cardData.prices.usd) || 0;
                const usdFoil = parseFloat(cardData.prices.usd_foil) || 0;
                displayPrice = Math.max(usd, usdFoil).toFixed(2);
            }

            sortedCards.push({ cardData, displayPrice });
        });

        // Sort the cards by the display price
        if (sortBy === 'highestPrice') {
            sortedCards.sort((a, b) => parseFloat(b.displayPrice) - parseFloat(a.displayPrice));
        } else if (sortBy === 'lowestPrice') {
            sortedCards.sort((a, b) => parseFloat(a.displayPrice) - parseFloat(b.displayPrice));
        }

        // Display the sorted cards
        sortedCards.forEach((card) => {
            const newRow = tbody.insertRow();

            const checkboxCell = newRow.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkboxCell.appendChild(checkbox);

            const cell1 = newRow.insertCell(1);
            const cell2 = newRow.insertCell(2);
            const cell3 = newRow.insertCell(3);
            const cell4 = newRow.insertCell(4);

            cell1.innerHTML = card.cardData.name;
            cell2.innerHTML = card.cardData.colors;
            cell3.innerHTML = card.cardData.converted_mana_cost;
            cell4.innerHTML = card.displayPrice;
        });
    }).catch((error) => {
        console.error("Error getting sorted cards: ", error);
    });
}



// Function to display card image popup when row is hovered over card name
function displayCardImagePopup(cardName, event) {
    // Get the URL of the card image from Firebase Storage
    getCardImageUrlFromStorage(cardName)
        .then((imageUrl) => {
            // Update the image in the popup container
            var popupContent = document.getElementById('cardImagePopupContent');
            if (imageUrl && popupContent) {
                popupContent.src = imageUrl;
            }

            // Position the popup
            var popup = document.getElementById('cardImagePopup');
            if (popup) {
                // Set the position of the popup relative to the mouse position
                popup.style.top = (event.clientY + 10) + 'px';
                popup.style.left = (event.clientX + 10) + 'px';

                // Show the popup
                popup.style.display = 'block';
            }
        })
        .catch((error) => {
            console.error('Error fetching card image:', error);
        });
}

// Function to get card image URL from Firebase Storage
function getCardImageUrlFromStorage(cardName) {
    return new Promise((resolve, reject) => {
        // Get the first letter of the card name
        var firstLetter = cardName.charAt(0).toLowerCase();

        // Create a reference to the folder containing card images
        var storageRef = firebase.storage().ref();
        var folderRef = storageRef.child('mtg_names_images/' + firstLetter + '/' + cardName + '/');

        // List all the items (files) in the folder
        folderRef.listAll().then(function(result) {
            if (result.items.length > 0) {
                // Get the URL of the first image in the folder
                result.items[0].getDownloadURL().then(function(url) {
                    resolve(url); // Resolve with the image URL
                }).catch(function(error) {
                    reject(error); // Reject with the error
                });
            } else {
                reject(new Error('No images found for ' + cardName));
            }
        }).catch(function(error) {
            reject(error); // Reject with the error
        });
    });
}


// Function to hide the card image popup
function hideCardImagePopup() {
    var popup = document.getElementById('cardImagePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}


// Event listener for hovering over card name cells
document.addEventListener('DOMContentLoaded', function() {
    var table = document.getElementById('cardTable');
    table.addEventListener('mouseover', function(event) {
        var target = event.target;
        if (target.tagName === 'TD' && target.parentNode.tagName === 'TR' && target.cellIndex === 1) {
            var cardName = target.textContent.trim();
            displayCardImagePopup(cardName, event);
        }
    });

    table.addEventListener('mouseout', function(event) {
        hideCardImagePopup();
    });
});



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





