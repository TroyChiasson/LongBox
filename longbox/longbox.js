
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

    const loginForm = document.getElementById("loginForm");
    loginForm.style.display = "none";
}

function login() {
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

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const formattedCardName = selectedCardName
        .toLowerCase()
        .split(' ')
        .map(word => {
            const articles = ['a', 'the', 'and', 'of']; 
            return articles.includes(word) ? word : capitalizeFirstLetter(word);
        })
        .join(' ');

    const user = firebase.auth().currentUser;
    if (!user) {
        return;
    }

    const dbRef = firebase.database().ref(); 

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


    cardRef.once('value')
        .then(snapshot => {
  
            let firstChildKey;
            snapshot.forEach(childSnapshot => {
                firstChildKey = childSnapshot.key;
                return true; 
            });

            // get first card data
            const firstChildData = snapshot.child(firstChildKey).val();
            console.log("First Child Data:", firstChildData);

    
            const db = firebase.firestore();

            
            const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

  
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


                const inputBox = document.getElementById('cardName');
                inputBox.value = ''; 

                const cardList = document.getElementById('cardList');
                const newRow = cardList.insertRow();

                // Create a checkbox in the first cell, can be put away later maybe
                const checkboxCell = newRow.insertCell(0);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkboxCell.appendChild(checkbox);

   
                const cardNameCell = newRow.insertCell(1);
                cardNameCell.className = 'card-name';
                cardNameCell.textContent = firstChildData.name;

       
                const cell2 = newRow.insertCell(2);
                const cell3 = newRow.insertCell(3);
                const cell4 = newRow.insertCell(4);

                cell2.innerHTML = firstChildData.color_identity.join(', '); 
                cell3.innerHTML = firstChildData.converted_mana_cost;
                cell4.innerHTML = firstChildData.prices.usd ? firstChildData.prices.usd : firstChildData.prices.usd_foil;

                // Add event listener to the card name cell for the popup menu
                cardNameCell.addEventListener('click', function(event) {
                    showPopupMenu(cardNameCell, event);
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


function showPopupMenu(cardNameCell, event) {
    var $cardName = $(cardNameCell);
    var $popupMenu = $('#cardOptionsMenu');

    var scrollY = window.scrollY;

    var position = $cardName.offset();

    var adjustedTop = position.top - scrollY + $cardName.outerHeight();

    var clickX = event.clientX;
    var clickY = event.clientY;

    var topPosition = clickY + scrollY;
    var leftPosition = clickX;

    $popupMenu.css({
        top: topPosition,
        left: leftPosition
    });

    $popupMenu.fadeIn(200);

    $(document).on('click', function(event) {
        if (!$(event.target).closest('#cardOptionsMenu, .card-name').length) {
            $popupMenu.fadeOut(200);
        }
    });
    return false;
}



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
        console.log('User not authenticated.');
        return;
    }

    checkboxes.forEach(checkbox => {
        const cardName = checkbox.closest("tr").querySelector("td:nth-child(2)").textContent;
        
        const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

        userCardsRef.where("name", "==", cardName)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.delete().then(() => {
                        console.log(doc.id +" successfully deleted from Firestore!");
                    }).catch(error => {
                        console.error("Error removing card from Firestore: ", error);
                        // alert('Failed to remove card from Firestore.');
                    });
               });
                /* querySnapshot.docs[0].ref.delete().then(() => {
                    console.log("Card successfully deleted from Firestore!");
                }).catch(error => {
                    console.error("Error removing card from Firestore: ", error);
                    // alert('Failed to remove card from Firestore.');
                }); */
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

function exportSelectedCards() {
    const checkboxes = document.querySelectorAll("#cardList input[type='checkbox']:checked");

    // Check if any card is selected
    if (checkboxes.length === 0) {
        alert('Please select at least one card to export.');
        return;
    }

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    // Check if user is authenticated
    if (!user) {
        alert('User not authenticated.');
        return;
    }
    
    //populate array with selected cards
    var cardList = [];
    checkboxes.forEach(checkbox => {
        const cardName = checkbox.closest("tr").querySelector("td:nth-child(2)").textContent;
        cardList.push(cardName);
    });
    exportCardsPopup(cardList);
}

function exportCardsPopup(cardList) {
    sortedList = structuredClone(cardList).sort();
    var count = 1;
    var cardExport = "";
    for (var i=0; i<sortedList.length; i++) {
        if (sortedList[i] == sortedList[i+1]) {
            count +=1;
        } else {
            cardExport += count + " " + sortedList[i] + "\n";
            count = 1;
        } 
    }
    alert('Copy/paste this list into a marketplace or deckbuilder of your choice!\n'+cardExport);
}


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

            const folderItem = document.createElement('li');
            folderItem.innerHTML = `
                <input type="checkbox" id="${folderName}" class="folder-checkbox">
                <label for="${folderName}">${folderName}</label>
            `;
            folderList.appendChild(folderItem);
            
            folderNameInput.value = ''; 
        })
        .catch(error => {
            console.error('Error adding folder:', error);
            // alert('Failed to add folder.');
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
        const existingTable = document.getElementById('folderCardTable');

        if (existingTable) {
            existingTable.remove();
        }

        const table = document.createElement('table');
        table.id = 'folderCardTable';
        table.classList.add('card-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Card Name', 'Color', 'Mana Cost', 'Price'];

        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        querySnapshot.forEach((doc) => {
            const cardData = doc.data();
            const cardName = cardData.name;
            const cardColor = cardData.color;
            const cardManaCost = cardData.converted_mana_cost;
            const cardPrice = cardData.prices.usd || cardData.prices || cardData.prices.usd_foil;

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

        table.appendChild(tbody);
        folderCardList.appendChild(table);

        // wrap table in a div to make it scrollable doesn't work
        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('table-wrapper');
        tableWrapper.appendChild(table);

        folderCardList.appendChild(tableWrapper);

        console.log(tbody);

    }).catch((error) => {
        console.error("Error getting cards from folder:", error);
    });
}


function displayFolderOptions() {
    const folderList = document.getElementById('folderList');

   
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        console.error('User not authenticated.');
        return;
    }

    const foldersRef = db.collection(`Users/${user.uid}/folders`);

    foldersRef.get().then(querySnapshot => {
        folderList.innerHTML = ''; 

        console.log("Folders retrieved:");
        querySnapshot.forEach(doc => {
            const folderName = doc.id.replace(/_/g, ' '); 
            console.log(folderName); 


            const folderItem = document.createElement('li');
            folderItem.textContent = folderName;
            folderItem.classList.add('folder-item'); 

            folderItem.addEventListener('click', function() {
                
                const folderName = this.textContent;
                addCardsToFolder(folderName);
                uncheckAllCards();
                getFoldersFromFirestore();
            });

            folderList.appendChild(folderItem);
        });
    }).catch(error => {
        console.error('Error getting folders:', error);
    });
}


async function addCardsToFolder(folderName) {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (!user) {
        console.error('User not authenticated.');
        return;
    }

    const foldersRef = db.collection(`Users/${user.uid}/folders`);
    const folderDocRef = foldersRef.doc(folderName);

   
    const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

    const cardsChecked = document.querySelectorAll("#cardList input[type='checkbox']:checked");

    for (const cardChecked of cardsChecked) {
        const cardName = cardChecked.closest("tr").querySelector("td:nth-child(2)").textContent;

        try {
           
            const cardQuerySnapshot = await userCardsRef.where('name', '==', cardName).get();

            if (!cardQuerySnapshot.empty) {
               
                const cardData = cardQuerySnapshot.docs[0].data(); 
                const folderCardsRef = folderDocRef.collection("cards");

                await folderCardsRef.add({
                    name: cardData.name,
                    set_code: cardData.set_code,
                    collector_number: cardData.collector_number,
                    color_identity: cardData.color_identity,
                    colors: cardData.colors,
                    converted_mana_cost: cardData.converted_mana_cost,
                    id: cardData.id,
                    mana_cost: cardData.mana_cost,
                    prices: cardData.prices,
                    type_of_card: cardData.type_of_card
                });

                console.log("Card added to folder:", folderName, "Card Name:", cardName);
            } else {
                console.error(`Card "${cardName}" not found in user's folder "All_Cards".`);
            }
        } catch (error) {
            console.error('Error adding card to folder:', error);
        }
    }
}




function uncheckAllCards() {
    const cardsChecked = document.querySelectorAll("#cardList input[type='checkbox']:checked");
    cardsChecked.forEach(function(cardChecked) {
        cardChecked.checked = false;
    });
}

function openFolderPage(folderName) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        return;
    }

    const url = `folder-details.html?folder=${encodeURIComponent(folderName)}&uid=${user.uid}`;
    window.location.href = url;
}

// maybe make this just take in a folde rname as paramter
function getCardsFromFirestore() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('User not authenticated.');
        return;
    }

    const db = firebase.firestore();
    const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

    userCardsRef.get().then((querySnapshot) => {
        const cardTable = document.getElementById('cardTable'); 
        if (!cardTable) {
            console.log('Card table element not found.');
            return;
        }

        const tbody = cardTable.querySelector('tbody');
        if (!tbody) {
            return;
        }

        tbody.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const cardData = doc.data();

            const newRow = tbody.insertRow();

            const checkboxCell = newRow.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkboxCell.appendChild(checkbox);

            const cell1 = newRow.insertCell(1);
            cell1.className = 'card-name';
            cell1.setAttribute('data-card-id', cardData.id);
            const cell2 = newRow.insertCell(2);
            const cell3 = newRow.insertCell(3);
            const cell4 = newRow.insertCell(4);
            console.log(cardData);

            cell1.innerHTML = cardData.name;
            cell2.innerHTML = cardData.colors;
            cell3.innerHTML = cardData.converted_mana_cost;
            cell4.innerHTML = cardData.prices.usd || cardData.prices.usd_foil || cardData.prices;



            cell1.addEventListener('click', function(event) {
                showPopupMenu(cell1, event);
            });

        });
    }).catch((error) => {
        console.error("Error getting documents: ", error);
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

            const folderName = doc.id.replace(/_/g, ' '); 

            const folderItem = document.createElement('li');
            folderItem.textContent = folderName;

            folderItem.addEventListener('click', () => {
                console.log(`Folder "${folderName}" clicked`);
                openFolderPage(folderName);
            });
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
        
        query = userCardsRef.orderBy('name');
    }

    const cardList = document.getElementById('cardTable');
    if (!cardList) {
        console.log('Card list element not found.');
        return;
    }

    let tbody = cardList.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        cardList.appendChild(tbody);
    } else {
        
        tbody.innerHTML = '';
    }

    query.get().then((querySnapshot) => {
        const sortedCards = [];
        querySnapshot.forEach((doc) => {
            const cardData = doc.data();

            
            let displayPrice = 'N/A';
            if (cardData.prices) {
                // const usd = parseFloat(cardData.prices.usd) || 0;
                // const usdFoil = parseFloat(cardData.prices.usd_foil) || 0;
                // displayPrice = usd.toFixed(2) || usdFoil.toFixed(2);
                displayPrice = cardData.prices
            }

            sortedCards.push({ cardData, displayPrice });
        });

        
        if (sortBy === 'highestPrice') {
            console.log(sortedCards.displayPrice);
            sortedCards.sort((a, b) => parseFloat(b.displayPrice) - parseFloat(a.displayPrice));
        } else if (sortBy === 'lowestPrice') {
            sortedCards.sort((a, b) => parseFloat(a.displayPrice) - parseFloat(b.displayPrice));
        }

        
        sortedCards.forEach((card) => {
            console.log("here is card from display sorted")
            console.log(card);

            
            const newRow = tbody.insertRow();

            const checkboxCell = newRow.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkboxCell.appendChild(checkbox);

            const cell1 = newRow.insertCell(1);
            cell1.className = 'card-name';
            cell1.setAttribute('data-card-id', card.cardData.id);
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

function getCardImageUrlFromStorage(cardName) {
    const currentUser = firebase.auth().currentUser;
    
    if (currentUser) {
        const uid = currentUser.uid;

        return new Promise((resolve, reject) => {
            var userRef = firebase.firestore().collection("Users").doc(uid).collection("folders").doc("All_Cards").collection("cards");
            
            userRef.where("name", "==", cardName).get().then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const cardData = querySnapshot.docs[0].data();
                    const set = cardData.set_code;
                    const collectorNumber = cardData.collector_number;

                    console.log(set);
                    console.log(collectorNumber);

                    var storageRef = firebase.storage().ref();
                    var filePath = `mtg_names_images/${cardName.charAt(0).toLowerCase()}/${cardName}/${set}_${collectorNumber}.jpg`;
                    var fileRef = storageRef.child(filePath);

                    fileRef.getDownloadURL().then(function(url) {
                        resolve(url); 
                    }).catch(function(error) {
                        reject(error); 
                    });
                } else {
                    reject(new Error('No card found for ' + cardName));
                }
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return Promise.reject(new Error('No user is currently signed in.'));
    }
}

function displayCardImagePopup(cardName, event) {
    getCardImageUrlFromStorage(cardName)
        .then((imageUrl) => {
            var popupContent = document.getElementById('cardImagePopupContent');
            if (imageUrl && popupContent) {
                popupContent.src = imageUrl;
            }

            var popup = document.getElementById('cardImagePopup');
            if (popup) {
            
                const mouseX = event.clientX + window.scrollX;
                const mouseY = event.clientY + window.scrollY;

            
                popup.style.top = (mouseY + 10) + 'px';
                popup.style.left = (mouseX + 10) + 'px';


                popup.style.display = 'block';
            }
        })
        .catch((error) => {
            console.error('Error fetching card image:', error);
        });
}



function hideCardImagePopup() {
    var popup = document.getElementById('cardImagePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function showImportListPopup() {
    $("#importListPopup").toggle();
}

function processCardList() {
    const importedCards = $("#importedList").val();

    let importedCardsArray = importedCards.split('\n');

    importedCardsArray = importedCardsArray.filter(card => card.trim() !== '');

    importedCardsArray.forEach((importedCard) => {
        
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

 
        const formattedCardName = cardName
            .toLowerCase()
            .replace(".", " ")
            .replace("?", "_")
            .replace("!", "_")
            .replace("/", "-")
            .replace("#", "-");

            const capitalizeFirstLetter = (string) => {
                return string.split('-').map(part => {
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                }).join('-');
            };

        
        const fixedName = formattedCardName
            .toLowerCase()
            .split(' ')
            .map(word => {
                const articles = ['a', 'the', 'and', 'of'];
                return articles.includes(word) ? word : capitalizeFirstLetter(word);
            })
            .join(' ');

        console.log("formatted name", fixedName);
        
        const db = firebase.database();
        const dbRef = db.ref(`/mtg_names/${firstLetter}/cards/${fixedName}/${finalSetCode}_${collectorNumber}`);

        console.log("db loca", dbRef);


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

                const userCardsRef = dbF.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");

            
                const cardToAdd = {
                    name: cardData.name,
                    set_code: cardData.set_code,
                    collector_number: cardData.collector_number,
                    color_identity: cardData.color_identity || null,
                    colors: cardData.colors || null,
                    converted_mana_cost: cardData.converted_mana_cost || null,
                    id: cardData.id || null,
                    mana_cost: cardData.mana_cost || null,
                    prices: cardData.prices.usd || cardData.prices.usd_foil || cardData.prices || null,
                    type_of_card: cardData.type_of_card || null,

                };

                for (let i=0; i<amount; i++) {
                    userCardsRef.add(cardToAdd)
                        .then((docRef) => {
                            console.log(`Card "${cardData.name}" added to Firestore with ID: ${docRef.id}`);
                        })
                        .catch((error) => {
                            console.error('Error adding card to Firestore:', error);
                        })
                        .finally(() => {
                            
                            getCardsFromFirestore();
                        });
                }
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
        var cardId = $(this).data('card-id');
        console.log('Clicked Card Name:', cardName);
        console.log('Card ID:', cardId);

        storeClickedCardInfo(cardName, cardId);
    });

    $(document).on('click', '.buy-tcgplayer', function(e) {
        e.preventDefault();

        var cardName = getLastClickedCardName();
        console.log('Buy on TCG Player:', cardName.name);
        buyOnTCG(cardName.name);
    });

    $(document).on('click', '.buy-cardkingdom', function(e) {
        e.preventDefault(); 

        var cardName = getLastClickedCardName();
        console.log('Buy on Card Kingdom:', cardName.name);
        buyOnCardKingdom(cardName.name);
    });

    $(document).on('click', '.switch-collector', function(e) {
        e.preventDefault(); 

        var cardName = getLastClickedCardName();
        console.log('Switch Collector Number:', cardName);

        switchCollector(cardName, e);
    });

    function storeClickedCardInfo(cardName, cardId) {
        const clickedCardInfo = {
            name: cardName,
            id: cardId
        };
        clickedCardNames.push(clickedCardInfo);
        console.log('Stored Card Info:', clickedCardNames);
    }

    function getLastClickedCardName() {
        if (clickedCardNames.length > 0) {
            return clickedCardNames[clickedCardNames.length - 1];
        } else {
            return null;
        }
    }

    function buyOnTCG(cardName) {
        const baseUrl = 'https://www.tcgplayer.com/search/all/product?q=';
        const url = `${baseUrl}${encodeURIComponent(cardName)}&view=grid`;

        window.open(url, '_blank');
    }

    function buyOnCardKingdom(cardName) {
        const baseUrl = 'https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=';
        const url = `${baseUrl}${encodeURIComponent(cardName)}`;


        window.open(url, '_blank');
    }

    function switchCollector(cardName, event) {

        console.log(cardName.name);
        card = cardName.name
        id = cardName.id
        const firstLetter = card.toLowerCase().charAt(0);
        console.log(firstLetter);
        
        
        var storageRef = firebase.storage().ref();
        var imagesRef = storageRef.child('mtg_names_images/' + firstLetter + '/' + card);
        
        

        console.log("folder locat", imagesRef);
    

        imagesRef.listAll().then(function(result) {
            var urls = [];
            result.items.forEach(function(itemRef) {
                itemRef.getDownloadURL().then(function(url) {
                    urls.push(url);
                    if (urls.length === result.items.length) {
                     
                        displayImagesInTable(urls,card, event);
                        
                    }
                }).catch(function(error) {
                    console.error('Error getting download URL:', error);
                });
            });
        }).catch(function(error) {
            console.error('Error listing images:', error);
        });
    }
    
    function displayImagesInTable(imageUrls, card, event) {

        var table = document.createElement('table');
        

        var mouseX = event.clientX;
        var mouseY = event.clientY;
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;
        var popupWidth = 320; 
        var popupHeight = 150; 
        var popupOffsetX = 20; 
        var popupOffsetY = 20; 
        var popupLeft = Math.min(mouseX + popupOffsetX, viewportWidth - popupWidth); 
        var popupTop = Math.min(mouseY + popupOffsetY, viewportHeight - popupHeight); 
    

        table.style.position = '';
        table.style.left = popupLeft + 'px';
        table.style.top = popupTop + 'px';
        table.style.width = popupWidth + 'px';
        table.style.height = popupHeight + 'px';
        table.style.backgroundColor = '#f2f2f2'; 
        table.style.padding = '10px'; 
        table.style.borderRadius = '5px'; 
        table.style.overflowY = 'auto';
    
    
        var tbody = document.createElement('tbody');

        for (var i = 0; i < imageUrls.length; i += 3) {
            var row = tbody.insertRow();
            for (var j = i; j < i + 3 && j < imageUrls.length; j++) {
                var cell = row.insertCell();
                var image = document.createElement('img');
                image.src = imageUrls[j];
                image.style.width = '175px';
                image.style.height = '225px'; 
                image.style.margin = '5px'; 
                image.style.cursor = 'pointer';
        
            
                image.addEventListener('click', function() {
                   
                    var imageUrl = this.src;
                    var parts = imageUrl.split('%2F');
                    var imageName = parts[parts.length - 1];
                    var imageNameWithoutParams = imageName.split('?')[0];
                    var setAndCollector = imageNameWithoutParams.split('.')[0];
                    var set = setAndCollector.split('_')[0];
                    var collectorNumber = setAndCollector.split('_')[1];
        
                 
                    console.log('Clicked on image:', imageUrl);
                    console.log('Set Name:', set);
                    console.log('Collector Number:', collectorNumber);
        
             
                    handleImageClick(card, set, collectorNumber);
        
              
                    table.parentNode.removeChild(table);
                });
        
        
                cell.appendChild(image);
            }
        }
    
   
        table.appendChild(tbody);
    

        document.body.appendChild(table);
    }
    
    
    
    
    function handleImageClick(card, set, collectorNumber) {
        console.log('Handling Image Click for Set:', set, 'and Collector Number:', collectorNumber);
        console.log(card);
    

        const firstLetter = card.toLowerCase().charAt(0);
    

        const cardRef = firebase.database().ref(`mtg_names/${firstLetter}/cards/${card}/${set}_${collectorNumber}`);
    

        cardRef.once('value').then((snapshot) => {
        
            const cardData = snapshot.val();
    
            if (cardData) {
          
                console.log('Card Data:', cardData);
    
          
                const price = (cardData.prices && cardData.prices.usd) ? cardData.prices.usd : (cardData.prices && cardData.prices.usd_foil) ? cardData.prices.usd_foil : null;
                console.log('Price:', price);
    
        
                const db = firebase.firestore();
                const user = firebase.auth().currentUser;
                const userCardsRef = db.collection(`Users/${user.uid}/folders`).doc("All_Cards").collection("cards");
    

                userCardsRef.where('name', '==', card).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const cardId = doc.id;
                        const cardRef = userCardsRef.doc(cardId);
                
    
                    
                        cardRef.update({
                            set_code: set,
                            collector_number: collectorNumber,
                            prices: price
                        }).then(() => {
                            console.log('Card info updated successfully.');

                            getCardsFromFirestore();
                        }).catch((error) => {
                            console.error('Error updating card info:', error);
                        });
                    });
                }).catch((error) => {
                    console.error('Error searching for card:', error);
                });
            } else {
                console.log('No card found with the name:', card);
            }
        }).catch((error) => {
            console.error('Error getting card data:', error);
        });
    }
    
    
    
    
    // Listen for the custom event 'displayCardImage'
    document.addEventListener('displayCardImage', function(event) {
        const cardName = event.detail;
        displayCardImagePopup(cardName);
    });

});
// event listener for hovering over card name cells in cardList
document.addEventListener('DOMContentLoaded', function() {
    const cardList = document.getElementById('cardList');

    // event listener on cardList for mouseover events
    cardList.addEventListener('mouseover', function(event) {
        const target = event.target;

        // if the mouseover target is a 'td' element inside a 'tr' element
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


// initialization Functions
function initializeEventListeners() {
    const addButton = document.getElementById('addCardForm').querySelector('button');
    addButton.onclick = function() {
        addCard();
    };

    document.getElementById('removeCardsButton').onclick = removeSelectedCards;
    document.getElementById('addToFolderButton').onclick = displayFolderOptions;

}



// call initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);





