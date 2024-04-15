const winnersList = document.getElementById('winnersList');
const losersList = document.getElementById('losersList');

let currentTooltip = null; 

function createFinanceCard(cardName, set, oldPrice, newPrice, percentageChange, collectorNumber, image) {
    const row = document.createElement('tr');
    row.setAttribute('id', `${cardName}-${collectorNumber}`);
    row.setAttribute('data-image', image);

    const rowData = `
        <td class="card-name">${cardName} ${collectorNumber}</td>
        <td>${set}</td>
        <td>${oldPrice}</td>
        <td>${newPrice}</td>
        <td>${percentageChange}%</td>
    `;

    row.innerHTML = rowData;
    return row;
}


const popupContainer = document.createElement('div');
popupContainer.classList.add('popup-container');
document.body.appendChild(popupContainer);


function displayTopWinnersLosers(userId) {
    if (!userId) {
        console.error("User is not authenticated.");
        return;
    }

    const winnersRef = firebase.database().ref('/Prices/Top50/Positive');
    const losersRef = firebase.database().ref('/Prices/Top50/Negative');

    winnersRef.orderByChild('percentageChange').limitToLast(50).once('value', (winnersSnapshot) => {
        winnersSnapshot.forEach((winnerSnapshot) => {
            const cardData = winnerSnapshot.val();
            const cardName = cardData.card_name;
            const set = cardData.set_code;
            const collectorNumber = cardData.collector_number;
            const priceDiff = cardData.price_diff;
            const priceType = cardData.price_type;
            const percentageChange = cardData.percentage_change;
            const image = `mtg_names_images/${cardName.toLowerCase().charAt(0)}/${cardName}/${set}_${collectorNumber}.jpg`;

            const oldPrice = (priceDiff / (percentageChange / 100)).toFixed(2);
            const newPrice = (parseFloat(oldPrice) + parseFloat(priceDiff)).toFixed(2);

            const winnerCard = createFinanceCard(cardName, set, oldPrice, newPrice, parseFloat(percentageChange).toFixed(2), collectorNumber, image);
            winnersList.appendChild(winnerCard);

            winnerCard.addEventListener('mouseover', (event) => {
                displayCardImage(winnerCard, image, event);
            });

            winnerCard.addEventListener('mouseout', () => {
                hideCardImage();
            });

            winnerCard.addEventListener('click', () => {
                navigateToCardDetails(cardName);
            });
        });
    });

    losersRef.orderByChild('percentageChange').limitToLast(50).once('value', (losersSnapshot) => {
        losersSnapshot.forEach((loserSnapshot) => {
            const cardData = loserSnapshot.val();
            const cardName = cardData.card_name;
            const set = cardData.set_code;
            const collectorNumber = cardData.collector_number;
            const priceDiff = cardData.price_diff;
            const priceType = cardData.price_type;
            const percentageChange = cardData.percentage_change;
            const image = `mtg_names_images/${cardName.toLowerCase().charAt(0)}/${cardName}/${set}_${collectorNumber}.jpg`;

            const oldPrice = (priceDiff / (percentageChange / 100)).toFixed(2);
            const newPrice = (parseFloat(oldPrice) + parseFloat(priceDiff)).toFixed(2);

            const loserCard = createFinanceCard(cardName, set, oldPrice, newPrice, parseFloat(percentageChange).toFixed(2), collectorNumber, image);
            losersList.appendChild(loserCard);

            // Add event listener for mouseover to show the image of the card
            loserCard.addEventListener('mouseover', (event) => {
                displayCardImage(loserCard, image, event);
            });

            // Add event listener for mouseout to delete but kinda not working
            loserCard.addEventListener('mouseout', () => {
                hideCardImage();
            });

            // Add event listener to navigate to card details page when clicked
            loserCard.addEventListener('click', () => {
                navigateToCardDetails(cardName);
            });
        });
    });

    // Sorting functions
    function sortByHighestPriceDescending(cards) {
        cards.sort((a, b) => parseFloat(b.querySelector('td:nth-child(3)').textContent) - parseFloat(a.querySelector('td:nth-child(3)').textContent));
    }

    function sortByLowestPriceAscending(cards) {
        cards.sort((a, b) => parseFloat(a.querySelector('td:nth-child(3)').textContent) - parseFloat(b.querySelector('td:nth-child(3)').textContent));
    }

    function sortByHighestPercentageDescending(cards) {
        cards.sort((a, b) => parseFloat(b.querySelector('td:nth-child(5)').textContent) - parseFloat(a.querySelector('td:nth-child(5)').textContent));
    }

    function sortByLowestPercentageAscending(cards) {
        cards.sort((a, b) => parseFloat(a.querySelector('td:nth-child(5)').textContent) - parseFloat(b.querySelector('td:nth-child(5)').textContent));
    }

    document.getElementById('sortHighestPrice').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByHighestPriceDescending(winnerCards);
        sortByHighestPriceDescending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    document.getElementById('sortLowestPrice').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByLowestPriceAscending(winnerCards);
        sortByLowestPriceAscending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    document.getElementById('sortHighestPercentage').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByHighestPercentageDescending(winnerCards);
        sortByHighestPercentageDescending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    document.getElementById('sortLowestPercentage').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByLowestPercentageAscending(winnerCards);
        sortByLowestPercentageAscending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });



    // changes dynamically
    function renderFinanceCards(cards, list) {
        list.innerHTML = '';
        cards.forEach((card) => {
            list.appendChild(card);
        });
    }


    function displayCardImage(element, imagePath, event) {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(imagePath);
    
        imageRef.getDownloadURL().then((url) => {
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.style.width = "70%"; 
    
            //  new container element for each card
            const newPopupContainer = document.createElement('div');
            newPopupContainer.classList.add('popup-container');
            newPopupContainer.appendChild(imgElement);
    
            const mouseX = event.clientX + 10; 
            const mouseY = event.clientY + 10 + window.scrollY; 
            newPopupContainer.style.left = `${mouseX}px`;
            newPopupContainer.style.top = `${mouseY}px`;
    
            // maybe look at for position
            document.body.appendChild(newPopupContainer);
    
            if (currentTooltip) {
                currentTooltip.style.display = "none";
            }
    
            currentTooltip = newPopupContainer;
        }).catch((error) => {
            console.error("Error getting image URL:", error);
        });
    }
    
    
function hideCardImage() {
    popupContainer.innerHTML = ''; 
    popupContainer.style.display = "none"; 
}
}

// buggy something isnt working
function updatePopupPosition(event) {
    const containerWidth = popupContainer.offsetWidth;
    const containerHeight = popupContainer.offsetHeight;
    const mouseX = event.clientX + 10;
    const mouseY = event.clientY + 10 + window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxTop = viewportHeight - containerHeight;
    const maxLeft = viewportWidth - containerWidth;

    popupContainer.style.left = `${Math.min(mouseX, maxLeft)}px`;

    popupContainer.style.top = `${Math.min(mouseY, maxTop)}px`;
}



window.addEventListener('scroll', () => {
    if (popupContainer.style.display === "block") {
        updatePopupPosition(event); 
    }
});

function displayPrices(cardName) {
    
    const url = `card-details.html?card=${encodeURIComponent(cardName)}`;

    const newTab = window.open(url, '_blank');
    if (newTab) {
        newTab.focus();
    } else {
        alert('Please allow pop-ups for this site to view card details.');
    }
}

function loadPersonalFinance() {
    winnersList.innerHTML = '';
    losersList.innerHTML = '';

    const winnersHeader = document.querySelector('#winnersList').parentElement.previousElementSibling;
    winnersHeader.textContent = "All Cards Folder";

    const losersHeader = document.querySelector('#losersList').parentElement.previousElementSibling;
    losersHeader.remove();

    const losersTable = document.getElementById('losersList').parentElement;
    losersTable.remove();


    const userId = firebase.auth().currentUser.uid;
    const personalFinanceRef = firebase.firestore().collection("Users").doc(userId).collection("folders").doc("All_Cards").collection("cards");;
    console.log(personalFinanceRef);

    personalFinanceRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(data);
            const { cardName, set, oldPrice, newPrice, percentageChange, collectorNumber, image } = data;
            const prices = data.prices.usd ? data.prices.usd : data.prices.usd_foil
            const card = createFinanceCard(data.name, data.set_code, prices, newPrice, percentageChange, data.collector_number, image);
            winnersList.appendChild(card);
        });
    }).catch((error) => {
        console.error("Error loading personal finance data:", error);
    });
}

function reloadPage() {
    location.reload();
}

function navigateToCardDetails(cardElement) {
    console.log(cardElement);
    const url = `card-details.html?card=${encodeURIComponent(cardElement)}`;
    window.location.href = url;
}

// may need to change this as well
document.addEventListener('mousemove', (event) => {
    updatePopupPosition(event); 
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        displayTopWinnersLosers(userId);
        console.log("User ID:", userId);
    } else {
        console.log("User is not logged in.");
    }
});
