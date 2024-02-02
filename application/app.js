function validateCollectorNumber() {
  const collectorsNumberInput = document.getElementById('collectorsNumber');
  const collectorsNumber = collectorsNumberInput.value;

  // Check to make sure input is only numbers
  const validInput = /^[0-9]+$/.test(collectorsNumber);
  if (!validInput) {
      alert("Please enter a valid Collector's Number with only numbers.");
      collectorsNumberInput.value = ''; // Clear input
  }
}
  
function addCard() {
  const collectorsNumber = document.getElementById('collectorsNumber').value;
  const cardName = document.getElementById('cardName').value;
  const color = document.getElementById('color').value;
  const manaCost = document.getElementById('manaCost').value;

  // Create a new table row
  const newRow = document.createElement('tr');
  // Create a checkbox cell
  const checkboxCell = document.createElement('td');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkboxCell.appendChild(checkbox);
  // Create table data cells for each column
  const collectorsNumberCell = document.createElement('td');
  collectorsNumberCell.textContent = collectorsNumber;

  const cardNameCell = document.createElement('td');
  cardNameCell.textContent = cardName;

  const colorCell = document.createElement('td');
  colorCell.textContent = color;

  const manaCostCell = document.createElement('td');
  manaCostCell.textContent = manaCost;

  // Append the cells to the new row
  newRow.appendChild(checkboxCell);
  newRow.appendChild(cardNameCell);
  newRow.appendChild(collectorsNumberCell);
  newRow.appendChild(colorCell);
  newRow.appendChild(manaCostCell);

  // Get the table body and append the new row
  const cardList = document.getElementById('cardList');
  cardList.appendChild(newRow);

  // Clear input fields
  document.getElementById('collectorsNumber').value = '';
  document.getElementById('cardName').value = '';
  document.getElementById('color').selectedIndex = 0;
  document.getElementById('manaCost').value = '';
}

// listeners for checkbox changes
const checkboxes = document.querySelectorAll("input[type='checkbox']");
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange);
});

// Function to handle checkbox changes
function handleCheckboxChange() {
    const cardList = document.getElementById("cardList");
    const checkboxes = cardList.querySelectorAll("input[type='checkbox']");
    const removeCardsButton = document.getElementById("removeCardsButton");

    let atLeastOneSelected = false;

    // Check if at least one checkbox is selected
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            atLeastOneSelected = true;
        }
    });

    // Show/hide the Remove Cards button based on selection
    if (atLeastOneSelected) {
      removeCardsButton.style.display = "block";
    } else {
      removeCardsButton.style.display = "none";
    }
}
  
function removeSelectedCards() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const cardList = document.getElementById("cardList");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const row = checkbox.closest("tr");
      cardList.removeChild(row);
    }
  });
}

// Function to toggle between tabs
function showTab(tabName) {
  var i, tabcontent;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}

document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('loginModal');
  var loginButton = document.getElementById('loginButton');
  var closeButton = document.getElementsByClassName('close')[0];

  loginButton.onclick = function() {
      modal.style.display = 'block';
  };

  closeButton.onclick = function() {
      modal.style.display = 'none';
  };

  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = 'none';
      }
  };
});
