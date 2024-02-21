
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

    // Get the first letter of the card name to fit file strcuture
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
            } else {
                alert('Card not found.');
            }
        })
        .catch(error => {
            console.error('Error getting card:', error);
            alert('Failed to get card data.');
        });
}




// function addCard(selectedCardName) {
//     // Validate input value
//     if (!selectedCardName) {
//         alert("Please enter a card name.");
//         return;
//     }

//     // Function to capitalize the first letter of each word
//     const capitalizeFirstLetter = (string) => {
//         return string.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
//             return char.toUpperCase();
//         });
//     };

//     // Convert selectedCardName to lowercase and capitalize the first letter of each word
//     const formattedCardName = selectedCardName
//         .toLowerCase()
//         .split(' ')
//         .map(word => {
//             const lowerCaseWords = ['a', 'the', 'and', 'of']; // Words to keep lowercase
//             return lowerCaseWords.includes(word) ? word : capitalizeFirstLetter(word);
//         })
//         .join(' ');

//     // Get the currently authenticated user
//     const user = firebase.auth().currentUser;
//     if (!user) {
//         alert('User not authenticated.');
//         return;
//     }

//     // Alert the card name for debugging
//     alert("Searching for card: " + formattedCardName);

//     // Reference to the Realtime Database
//     const dbRef = firebase.database().ref(); // Root reference

//     // Get the first letter of the card name
//     const firstLetter = formattedCardName.charAt(0).toLowerCase();

//     // Alert the path being traversed for debugging
//     alert("Traversing path: mtg_names/" + firstLetter + "/cards/" + formattedCardName);

//     // Reference to the specific card in the Realtime Database
//     const cardRef = dbRef.child("mtg_names").child(firstLetter).child("cards").child(formattedCardName);

//     // Retrieve the card data
//     cardRef.once('value')
//         .then(snapshot => {
//             const cardData = snapshot.val();
//             console.log(cardData); // Log card data to console for debugging
//             if (cardData) {
//                 const cardId = snapshot.key;

//                 // Reference to the user's collection of cards
//                 const userCardsRef = firebase.database().ref(`Users/${user.uid}/folders/All_Cards`);

//                 // Add the card to the user's collection
//                 userCardsRef.push({
//                     cardId,
//                     cardName: formattedCardName, // Use the formatted card name
//                     color: cardData.color,
//                     manaCost: cardData.mana_cost,
//                     amountOfColors: cardData.amount_of_colors,
//                     convertedManaCost: cardData.converted_mana_cost,
//                     id: cardData.id
//                 })
//                     .then((snapshot) => {
//                         // Alert the path where the card was added
//                         alert("Card added successfully at: " + snapshot.ref.toString());
//                     })
//                     .catch(error => {
//                         console.error('Error adding card:', error);
//                         alert('Failed to add card.');
//                     });
//             } else {
//                 alert('Card not found.');
//             }
//         })
//         .catch(error => {
//             console.error('Error getting card:', error);
//             alert('Failed to get card data.');
//         });
// }









// function addCard() {
//     // Retrieve input values
//     const collectorsNumber = document.getElementById('collectorsNumber').value;
//     const cardName = document.getElementById('cardName').value;
//     const color = document.getElementById('color').value;
//     const manaCost = document.getElementById('manaCost').value;

//     // Validate input values
//     if (!collectorsNumber || !cardName || !color || !manaCost) {
//         alert("Please fill out all fields.");
//         return;
//     }

//     // Get the currently authenticated user
//     const user = firebase.auth().currentUser;
//     if (!user) {
//         alert('User not authenticated.');
//         return;
//     }

//     // Reference to the Firestore database
//     const db = firebase.firestore();

//     // Query for the card based on mana cost, color, and name
//     db.collection('All_Cards')
//         .where('mana_cost', '==', manaCost)
//         .where('color', '==', color)
//         .where('name', '==', cardName)
//         .get()
//         .then(querySnapshot => {
//             if (querySnapshot.empty) {
//                 alert('Card not found.');
//             } else {
//                 // Assuming mana cost, color, and name uniquely identify a card
//                 const cardDoc = querySnapshot.docs[0];
//                 const cardId = cardDoc.id;

//                 // Reference to the user's collection of cards
//                 const userCardsRef = db.collection(`Users/${user.uid}/folders/All_Cards`);

//                 // Add reference to the card in the user's collection
//                 userCardsRef.add({ cardId })
//                     .then(() => {
//                         alert('Card added successfully.');
//                     })
//                     .catch(error => {
//                         console.error('Error adding card reference:', error);
//                         alert('Failed to add card reference.');
//                     });
//             }
//         })
//         .catch(error => {
//             console.error('Error getting card:', error);
//             alert('Failed to get card data.');
//         });
// }


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


    if (!userId) {
        alert('User ID not found in URL parameters.');
        return;
    }

    // Reference to the Firebase database
    const db = firebase.firestore();

    // Path to the folder
    const folderRef = db.collection('Users').doc(userId).collection('folders').doc(folderName);

    // Check if the folder already exists
    folderRef.get().then(doc => {
        if (doc.exists) {
            alert('Folder already exists.');
        } else {
            // Create the folder
            folderRef.set({}).then(() => {
                alert('Folder added successfully.');
            }).catch(error => {
                console.error('Error adding folder: ', error);
            });
        }
    }).catch(error => {
        console.error('Error checking folder existence: ', error);
    });

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

// function addCard() {
//     // Assuming the user is already authenticated
//     const currentUser = firebase.auth().currentUser;

//     if (currentUser) {
//         const userId = currentUser.uid;

//         // Reference to the 'All_User_cards' collection for the current user
//         const userCardsCollectionRef = firebase.firestore().collection('Users').doc(userId).collection('All_User_cards');

//         // Get input values from the form
//         const collectorsNumber = document.getElementById("collectorsNumber").value;
//         const cardName = document.getElementById("cardName").value;
//         const color = document.getElementById("color").value;
//         const manaCost = document.getElementById("manaCost").value;

//         // Add the new card to the 'All_User_cards' collection
//         userCardsCollectionRef.add({
//             collectorsNumber: collectorsNumber,
//             cardName: cardName,
//             color: color,
//             manaCost: manaCost,
//             // Add other card details as needed
//         })
//         .then((docRef) => {
//             console.log("Card added successfully with ID:", docRef.id);

//             // Optionally, you can clear the form fields after adding the card
//             document.getElementById("collectorsNumber").value = "";
//             document.getElementById("cardName").value = "";
//             document.getElementById("color").value = "";
//             document.getElementById("manaCost").value = "";

//             // Optionally, you can update the displayed card list
//             showUserCards();
//         })
//         .catch((error) => {
//             console.error("Error adding card:", error);
//         });
//     } else {
//         console.error("User not authenticated.");
//     }
// }
function validateCollectorNumber(){
    alert(firebase.userId)
}
// function addCardToFirestore() {
//     const collectorsNumber = document.getElementById("collectorsNumber").value;
//     const cardName = document.getElementById("cardName").value;
//     const color = document.getElementById("color").value;
//     const manaCost = document.getElementById("manaCost").value;

//     addCard({ collectorsNumber, cardName, color, manaCost })
//         .then((result) => {

//             // Optionally, you can clear the form fields after adding the card
//             document.getElementById("collectorsNumber").value = "";
//             document.getElementById("cardName").value = "";
//             document.getElementById("color").value = "";
//             document.getElementById("manaCost").value = "";
//         })
//         .catch((error) => {
//             console.error("Error adding card:", error);
//         });
// }