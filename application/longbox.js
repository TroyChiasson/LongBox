
if (firebase.apps.length === 0) {
    // alert("Firebase is not initialized.");
  } else {
    // alert("Firebase is initialized.")
  }

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
                return true; // Exit loop after the first child to simulate default card
            });

            // Get the data of the first child
            const firstChildData = snapshot.child(firstChildKey).val();
            console.log("First Child Data:", firstChildData);

    
            const db = firebase.firestore();

            
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
            })
            .then((docRef) => {
                // alert("Card added successfully at: " + docRef.path);

                const inputBox = document.getElementById('cardName');
                inputBox.value = ''; // Clear the input box after successful addition

                const cardList = document.getElementById('cardList');
                const newRow = cardList.insertRow();

                // Create a checkbox in the first cell, can be put away later maybe
                const checkboxCell = newRow.insertCell(0);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkboxCell.appendChild(checkbox);

                // Insert the card name as the second cell
                const cardNameCell = newRow.insertCell(1);
                cardNameCell.className = 'card-name';
                cardNameCell.textContent = firstChildData.name;

       
                const cell2 = newRow.insertCell(2);
                const cell3 = newRow.insertCell(3);
                const cell4 = newRow.insertCell(4);

                cell2.innerHTML = firstChildData.color_identity.join(', '); 
                cell3.innerHTML = firstChildData.converted_mana_cost;
                cell4.innerHTML = firstChildData.prices.usd_foil ? firstChildData.prices.usd_foil : firstChildData.prices.usd;

                // Add event listener to the card name cell for the popup menu
                cardNameCell.addEventListener('click', function() {
                    showPopupMenu(cardNameCell);
                });

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


}




// Function to show the popup menu when a card name is clicked
function showPopupMenu(cardNameCell) {
    var $cardName = $(cardNameCell);
    var $popupMenu = $('#cardOptionsMenu');

    // Position the popup menu next to the clicked card name
    var position = $cardName.position();
    $popupMenu.css({
        top: position.top + $cardName.outerHeight(),
        left: position.left
    });

    // Show the popup menu
    $popupMenu.fadeIn(200);

    // Handle click outside to close the popup
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#cardOptionsMenu, .card-name').length) {
            $popupMenu.fadeOut(200);
        }
    });

    // Prevent default link behavior
    return false;
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

    foldersRef.doc(folderName).set({})
        .then(() => {

            
            // Add the folder name to the UI with a checkbox
            const folderItem = document.createElement('li');
            folderItem.innerHTML = `
                <input type="checkbox" id="${folderName}" class="folder-checkbox">
                <label for="${folderName}">${folderName}</label>
            `;
            folderList.appendChild(folderItem);
            
            folderNameInput.value = ''; // Clear the input field
        })
        .catch(error => {
            console.error('Error adding folder:', error);
            // alert('Failed to add folder.');
        });
}

function displayFolderContents(folderName) {
    folderName = String(folderName);
    // Replace spaces with underscores in folderName
    const formattedFolderName = folderName.replace(/\s+/g, '_');

    console.log("Folder name clicked:", formattedFolderName);

    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const cardsRef = db.collection(`Users/${user.uid}/folders/${formattedFolderName}/cards`);

    cardsRef.get().then((querySnapshot) => {
        const cardList = $("#folderCardList");

        // Clear existing card list before populating again
        cardList.empty();

        querySnapshot.forEach((doc) => {
            const cardData = doc.data();
            const cardName = cardData.name;
            const cardColor = cardData.color;

            const newRow = $("<tr>");
            const checkboxCell = $("<td>").appendTo(newRow);
            const checkbox = $("<input>").attr("type", "checkbox").attr("name", "selectedCard").val(doc.id);
            checkbox.appendTo(checkboxCell);

            $("<td>").text(cardName).appendTo(newRow);
            $("<td>").text(cardColor).appendTo(newRow);

            newRow.appendTo(cardList);
        });

        console.log("Cards retrieved successfully from folder:", formattedFolderName);
    }).catch((error) => {
        console.error("Error getting cards from folder:", formattedFolderName, error);
    });
}


function getFolderContents(folderName) {
    const user = firebase.auth().currentUser;

    if (!user) {
        console.log('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const cardsRef = db.collection(`Users/${user.uid}/folders/${folderName}/cards`);

    cardsRef.get().then((querySnapshot) => {
        const folderCardList = document.getElementById('folderCardList');
        const table = document.getElementById('cardTable');
        const tbody = table.querySelector('tbody');

        // Clear existing rows
        tbody.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const cardData = doc.data();
            const cardName = cardData.name;
            const cardColor = cardData.color;
            const cardManaCost = cardData.converted_mana_cost;
            const cardPrice = cardData.prices.usd_foil ? cardData.prices.usd_foil : cardData.prices.usd;

            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = cardName;
            row.appendChild(nameCell);

            const colorCell = document.createElement('td');
            colorCell.textContent = cardColor;
            row.appendChild(colorCell);

            const manaCell = document.createElement('td');
            manaCell.textContent = cardManaCost;
            row.appendChild(manaCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = cardPrice;
            row.appendChild(priceCell);

            tbody.appendChild(row);
        });

        // Check if table already exists and remove it before appending the new one
        const existingTable = folderCardList.querySelector('#cardTable');
        if (existingTable) {
            existingTable.remove();
        }


        folderCardList.appendChild(table);

        console.log(tbody);

    }).catch((error) => {
        console.error("Error getting cards from folder:", error);
    });
}




// Need to fix add to folder
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

    // may need to fix route
    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    // Loop through each selected folder checkbox, but need to fix it so they all have checkboxes
    folderCheckboxes.forEach(function(folderCheckbox) {
        const folderName = folderCheckbox.closest("tr").querySelector("td:nth-child(2)").textContent;

        const folderDocRef = foldersRef.doc(folderName);

        cardsChecked.forEach(function(cardChecked) {
            const cardName = cardChecked.closest("tr").querySelector("td:nth-child(2)").textContent;

            // Reference to the specific collection in Firestore for cards in this folder
            const folderCardsRef = folderDocRef.collection("cards");

            // need to maybe fix so that it grabs the info from the rtdb then inserts
            folderCardsRef.add({
                cardName: cardName
            })
            .then((docRef) => {
                console.log("Card added to folder:", folderName, "Card Name:", cardName);
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
}


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

            const cell1 = newRow.insertCell(1);
            const cell2 = newRow.insertCell(2);
            const cell3 = newRow.insertCell(3);
            const cell4 = newRow.insertCell(4);

            cell1.innerHTML = cardData.name;
            cell2.innerHTML = cardData.colors;
            cell3.innerHTML = cardData.converted_mana_cost;
            cell4.innerHTML = cardData.prices.usd_foil ? cardData.prices.usd_foil : cardData.prices.usd;
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
        return;
    }

    const db = firebase.firestore();
    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    foldersRef.get().then((querySnapshot) => {
        const folderList = document.getElementById('folderList');

        folderList.innerHTML = '';

        querySnapshot.forEach((doc) => {

            const folderName = doc.id.replace(/_/g, ' '); // Replace underscores with spaces

            const folderItem = document.createElement('li');
            folderItem.textContent = folderName;

            folderItem.addEventListener('click', () => {
                console.log(`Folder "${folderName}" clicked`);
                displayFolderContents(folderName);
            });

            // Append the folder item to the folder list
            folderList.appendChild(folderItem);
        });
    }).catch((error) => {
        console.error("Error getting folders: ", error);
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


// maybe make it accept the folder name, would have to figure out how to pass that as a paramter
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
 
        var firstLetter = cardName.charAt(0).toLowerCase();

        var storageRef = firebase.storage().ref();
        var folderRef = storageRef.child('mtg_names_images/' + firstLetter + '/' + cardName + '/');

        // List all the items (files) in the folder
        folderRef.listAll().then(function(result) {
            if (result.items.length > 0) {
                // Get the URL of the first image in the folder
                result.items[0].getDownloadURL().then(function(url) {
                    resolve(url); // Resolve with the image URL
                }).catch(function(error) {
                    reject(error); 
                });
            } else {
                reject(new Error('No images found for ' + cardName));
            }
        }).catch(function(error) {
            reject(error); 
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


// Show the Import List Popup
function showImportListPopup() {
    $("#importListPopup").toggle();
}

function processCardList() {
    const importedCards = $("#importedList").val();

    // Split the imported cards into an array by newline character
    let importedCardsArray = importedCards.split('\n');

    importedCardsArray = importedCardsArray.filter(card => card.trim() !== '');


    importedCardsArray.forEach((importedCard) => {
        // Split the string to get amount, name, set code, and collector number
        const [amount, ...rest] = importedCard.trim().split(' ');

        const collectorNumber = rest.pop();
        const setCode = rest.pop();
        const finalSetCode = setCode.slice(1, -1).toLowerCase();
        const cardName = rest.join(' ');

        console.log("Amount:", amount);
        console.log("Card Name:", cardName);
        console.log("Set Code:", finalSetCode);
        console.log("Collector Number:", collectorNumber);

        const firstLetter = cardName.charAt(0).toLowerCase();

        // Replace special characters in the card name to use as a key
        const formattedCardName = cardName
            .toLowerCase()
            .replace(".", " ")
            .replace("?", "_")
            .replace("!", "_")
            .replace("/", "-")
            .replace("#", "-");

        const capitalizeFirstLetter = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };

        // Convert selectedCardName to lowercase and capitalize each word except specified articles for pathing
        const fixedName = formattedCardName
            .toLowerCase()
            .split(' ')
            .map(word => {
                const articles = ['a', 'the', 'and', 'of']; 
                return articles.includes(word) ? word : capitalizeFirstLetter(word);
            })
            .join(' ');

        console.log("format name", fixedName);

        const db = firebase.database();
        const dbRef = db.ref(`/mtg_names/${firstLetter}/cards/${fixedName}/${finalSetCode}_${collectorNumber}`);

        console.log("db loca", dbRef);

        // Get the card data from Realtime Database
        dbRef.once('value', (snapshot) => {
            const cardData = snapshot.val();
            if (cardData) {
                console.log(cardData);
                const user = firebase.auth().currentUser;
                if (!user) {
                    console.error('User not authenticated.');
                    return;
                }

                const dbF = firebase.firestore();
                // Reference to the Firestore collection
                const userCardsRef = dbF.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

                // error handling before adding
                const cardToAdd = {
                    name: cardData.name,
                    set_code: cardData.set_code,
                    collector_number: cardData.collector_number,
                    color_identity: cardData.color_identity || null,
                    colors: cardData.colors || null,
                    converted_mana_cost: cardData.converted_mana_cost || null,
                    id: cardData.id || null,
                    mana_cost: cardData.mana_cost || null,
                    prices: cardData.prices || null,
                    type_of_card: cardData.type_of_card || null, 
                
                };

                // Add the card to the user's collection
                userCardsRef.add(cardToAdd)
                    .then((docRef) => {
                        console.log(`Card "${cardData.name}" added to Firestore with ID: ${docRef.id}`);
                    })
                    .catch((error) => {
                        console.error('Error adding card to Firestore:', error);
                    });
            } else {
                console.error(`Card "${cardName}" not found in the Realtime Database.`);
            }
        });
    });
}




$(document).ready(function() {

    var clickedCardNames = [];

    $(document).on('click', '.card-name', function(e) {
        e.stopPropagation();

        $(this).closest('tr').find('.card-options-menu').toggle();
        
        var cardName = $(this).text().trim();
        console.log('Clicked Card Name:', cardName);

        storeClickedCardName(cardName);
    });

    $(document).on('click', '.buy-tcgplayer', function(e) {
        e.preventDefault();

        var cardName = getLastClickedCardName();
        console.log('Buy on TCG Player:', cardName);
        buyOnTCG(cardName);
    });

    $(document).on('click', '.buy-cardkingdom', function(e) {
        e.preventDefault(); 

        var cardName = getLastClickedCardName();
        console.log('Buy on Card Kingdom:', cardName);
        buyOnCardKingdom(cardName);
    });

    $(document).on('click', '.switch-collector', function(e) {
        e.preventDefault(); 

        var cardName = getLastClickedCardName();
        console.log('Switch Collector Number:', cardName);

        switchCollector(cardName);
    });

    // Function to store the clicked card name because its easier
    function storeClickedCardName(cardName) {
        clickedCardNames.push(cardName);
        console.log('Stored Card Names:', clickedCardNames);
    }

    // Function to retrieve the last clicked card name because I couldn't figure out other way
    function getLastClickedCardName() {
        if (clickedCardNames.length > 0) {
            return clickedCardNames[clickedCardNames.length - 1];
        } else {
            return null;
        }
    }

    // TCGplayer search URL for the clicked card name
    function buyOnTCG(cardName) {
        const baseUrl = 'https://www.tcgplayer.com/search/all/product?q=';
        const url = `${baseUrl}${encodeURIComponent(cardName)}&view=grid`;

        window.open(url, '_blank');
    }

    // Card Kingdom search URL for the clicked card name
    function buyOnCardKingdom(cardName) {
        const baseUrl = 'https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=';
        const url = `${baseUrl}${encodeURIComponent(cardName)}`;


        window.open(url, '_blank');
    }

    function switchCollector(cardName) {
        function capitalizeFirstLetter(string) {
            return string.replace(/\b\w/g, function(char) {
                return char.toUpperCase();
            });
        }
    
        const firstLetter = cardName.toLowerCase().charAt(0);
        console.log(firstLetter);
    
        const folderName = capitalizeFirstLetter(cardName.toLowerCase().replace(/\s/g, '_'));
        console.log(folderName);
    
        var storageRef = firebase.storage().ref();
        var imagesRef = storageRef.child('mtg_names_images/' + firstLetter + '/' + folderName);
    
        // Fetch all the images in the folder
        imagesRef.listAll().then(function(result) {
            var urls = [];
            result.items.forEach(function(itemRef) {
                itemRef.getDownloadURL().then(function(url) {
                    urls.push(url);
                    if (urls.length === result.items.length) {
                     
                        displayImagesInTable(urls);
                    }
                }).catch(function(error) {
                    console.error('Error getting download URL:', error);
                });
            });
        }).catch(function(error) {
            console.error('Error listing images:', error);
        });
    }
    
    function displayImagesInTable(imageUrls) {
        var table = document.createElement('table');
    
        for (var i = 0; i < imageUrls.length; i += 3) {
            var row = table.insertRow();
            for (var j = i; j < i + 3 && j < imageUrls.length; j++) {
                var cell = row.insertCell();
                var image = document.createElement('img');
                image.src = imageUrls[j];
                image.style.width = '100px';
                image.style.cursor = 'pointer';
    
                image.addEventListener('click', function() {
                    // Get the image URL by splicing the string, could be better way
                    var imageUrl = this.src;
                
                    var parts = imageUrl.split('%2F');
                
                    var imageName = parts[parts.length - 1];
                
                    var imageNameWithoutParams = imageName.split('?')[0];
                   
                    var setAndCollector = imageNameWithoutParams.split('.')[0];
                    var set = setAndCollector.split('_')[1];
                    var collectorNumber = setAndCollector.split('_')[2];
                    
                    console.log('Clicked on image:', imageUrl);
                    console.log('Set Name:', set);
                    console.log('Collector Number:', collectorNumber);
    
                    handleImageClick(set, collectorNumber);
                    
              
                    table.parentNode.removeChild(table);
                });
    
                cell.appendChild(image);
            }
        }
    
        document.body.appendChild(table);
    }
    
    function handleImageClick(set, collectorNumber) {
        console.log('Handling Image Click for Set:', set, 'and Collector Number:', collectorNumber);
    }
    
    
    
    // Listen for the custom event 'displayCardImage'
    document.addEventListener('displayCardImage', function(event) {
        const cardName = event.detail;
        displayCardImagePopup(cardName);
    });

});
// Event listener for hovering over card name cells in cardList
document.addEventListener('DOMContentLoaded', function() {
    const cardList = document.getElementById('cardList');

    // Event listener on cardList for mouseover events
    cardList.addEventListener('mouseover', function(event) {
        const target = event.target;

        // Check if the mouseover target is a 'td' element inside a 'tr' element
        if (target.tagName === 'TD' && target.parentNode.tagName === 'TR' && target.cellIndex === 1) {
            const cardName = target.textContent.trim();
            displayCardImagePopup(cardName, event);
        }
    });

    // Event listener on cardList for mouseout events
    cardList.addEventListener('mouseout', function(event) {
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





