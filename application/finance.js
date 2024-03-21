const winnersList = document.getElementById('winnersList');
const losersList = document.getElementById('losersList');

let currentTooltip = null; // Track the current tooltip

// Function to get and display top 50 winners and losers could be excessive
function displayTopWinnersLosers(userId) {
    // Check if the user is authenticated to double check, could be deleted unsure yet
    if (!userId) {
        console.error("User is not authenticated.");
        return;
    }

    const winnersRef = firebase.database().ref('/Prices/Top50/Positive');
    const losersRef = firebase.database().ref('/Prices/Top50/Negative');

    winnersRef.orderByChild('percentageChange').limitToLast(50).once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const cardData = childSnapshot.val();
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

            // Add event listener for mouseover to show the image of the card
            winnerCard.addEventListener('mouseover', () => {
                displayCardImage(winnerCard, image);
            });

            // Add event listener for mouseout to delete old image
            winnerCard.addEventListener('mouseout', () => {
                hideCardImage();
            });
        });
    });

    losersRef.orderByChild('percentageChange').limitToLast(50).once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const cardData = childSnapshot.val();
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

            // Add event listener for mouseover to show the card not quite working
            loserCard.addEventListener('mouseover', () => {
                displayCardImage(loserCard, image);
            });

            // Add event listener for mouseout to delete but kinda not working
            loserCard.addEventListener('mouseout', () => {
                hideCardImage();
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

    // Event listener for highest price descending to filter
    document.getElementById('sortHighestPrice').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByHighestPriceDescending(winnerCards);
        sortByHighestPriceDescending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    // Event listener for lowest price ascending to filter
    document.getElementById('sortLowestPrice').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByLowestPriceAscending(winnerCards);
        sortByLowestPriceAscending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    // Event listener for highest percentage descending to filter
    document.getElementById('sortHighestPercentage').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByHighestPercentageDescending(winnerCards);
        sortByHighestPercentageDescending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

    // Event listener for lowest percentage ascending to filter
    document.getElementById('sortLowestPercentage').addEventListener('click', () => {
        const winnerCards = Array.from(winnersList.children);
        const loserCards = Array.from(losersList.children);
        sortByLowestPercentageAscending(winnerCards);
        sortByLowestPercentageAscending(loserCards);
        renderFinanceCards(winnerCards, winnersList);
        renderFinanceCards(loserCards, losersList);
    });

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

    // changes dynamically
    function renderFinanceCards(cards, list) {
        list.innerHTML = '';
        cards.forEach((card) => {
            list.appendChild(card);
        });
    }

    // Function to display card image on hover
    function displayCardImage(element, imagePath) {
        // make sure clear, doesn't seem to work
        hideCardImage();

        // Create new tooltip to show image
        const tooltip = document.createElement('div');
        tooltip.classList.add('card-tooltip');
        
        // Get the ref for image
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(imagePath);

        // Get the download URL built in function for the image
        imageRef.getDownloadURL().then((url) => {
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.style.width = "50%"; // size because original was far too large
            tooltip.appendChild(imgElement);
            element.appendChild(tooltip);
            currentTooltip = tooltip;
        }).catch((error) => {
            console.error("Error getting image URL:", error);
        });
    }

    // mouse hover off should delete but it needs work
    function hideCardImage() {
        if (currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
        }
    }
}

// Get the current user ID more for testing but could be useful later
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        displayTopWinnersLosers(userId);
        console.log("User ID:", userId);
    } else {
        console.log("User is not logged in.");
    }
});
