const winnersList = document.getElementById('winnersList');
const losersList = document.getElementById('losersList');

let currentTooltip = null; 
let tooltipTimeout;

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

         
            loserCard.addEventListener('mouseover', (event) => {
                displayCardImage(loserCard, image, event);
            });

  
            loserCard.addEventListener('mouseout', () => {
                hideCardImage();
            });

          
            loserCard.addEventListener('click', () => {
                navigateToCardDetails(cardName);
            });
        });
    });


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
        clearTimeout(tooltipTimeout); 
    
    
        tooltipTimeout = setTimeout(() => {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
        
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(imagePath);
        
            imageRef.getDownloadURL().then((url) => {
                const imgElement = document.createElement('img');
                imgElement.src = url;

                const imageSize = '225px';
                const imageHeight = '250px'; 
                imgElement.style.width = imageSize;
                imgElement.style.height = imageHeight;
            
                            
                const tooltip = document.createElement('div');
                tooltip.classList.add('card-tooltip');
    

                tooltip.style.width = imageSize;
    
       
                tooltip.style.padding = '5px';
    
           
                tooltip.appendChild(imgElement);
        
                // depricated need to find alternative
                const scrollX = window.pageXOffset;
                const scrollY = window.pageYOffset;
                const tooltipX = mouseX + scrollX + 10;
                const tooltipY = mouseY + scrollY + 10;
        
       
                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;
        
         
                document.body.appendChild(tooltip);
        
        
                currentTooltip = tooltip;
            }).catch((error) => {
                console.error("Error getting image URL:", error);
            });
        }, 200);
    }
    
    
    function hideCardImage() {
       
        const tooltips = document.querySelectorAll('.card-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.remove();
        });
        currentTooltip = null;
    }
    

}

// // buggy something isnt working
// function updatePopupPosition(event) {
//     const containerWidth = popupContainer.offsetWidth;
//     const containerHeight = popupContainer.offsetHeight;
//     const mouseX = event.clientX + 10;
//     const mouseY = event.clientY + 10 + window.scrollY;
//     const viewportWidth = window.innerWidth;
//     const viewportHeight = window.innerHeight;
//     const maxTop = viewportHeight - containerHeight;
//     const maxLeft = viewportWidth - containerWidth;

//     popupContainer.style.left = `${Math.min(mouseX, maxLeft)}px`;

//     popupContainer.style.top = `${Math.min(mouseY, maxTop)}px`;
// }

function updatePopupPosition(event) {

    const mouseX = event.clientX;
    const mouseY = event.clientY;


    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;


    const popupContainers = document.querySelectorAll('.popup-container');
    popupContainers.forEach(container => {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxTop = viewportHeight - containerHeight;
        const maxLeft = viewportWidth - containerWidth;

        const popupX = mouseX + scrollX + 10; 
        const popupY = mouseY + scrollY + 10; 

        container.style.left = `${Math.min(popupX, maxLeft)}px`;
        container.style.top = `${Math.min(popupY, maxTop)}px`;
    });
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
            const { cardName, set, oldPrice, percentageChange, collectorNumber, image } = data;
            const newPrice = 0;
            console.log(newPrice);
            console.log(percentageChange);
            const prices = (data.prices.usd || data.prices.usd_foil || data.prices)
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
