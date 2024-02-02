const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
  // Create the main application window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load the HTML file
  mainWindow.loadFile('app.html');

  // Handle when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });
  
    mainWindow.loadFile('app.html');
  
    // Add your JavaScript functions here
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.executeJavaScript(
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
    
    // Function to create a new folder
    function createFolder() {
        const folderName = document.getElementById('folderName').value;
        
        // Check if folderName is not empty
        if (folderName.trim() === '') {
            alert('Please enter a folder name.');
            return;
        }
    
        // Create a new folder list item
        const folderListItem = document.createElement('li');
        folderListItem.textContent = folderName;
    
        // Append the folder list item to the folder list
        const folderList = document.getElementById('folderList');
        folderList.appendChild(folderListItem);
    
        // Clear the folder name input field
        document.getElementById('folderName').value = '';
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
        document.getElementById('color').selectedIndex = 0; // Reset the color dropdown to its default option
        document.getElementById('manaCost').value = '';
    }
    // Add listeners for checkbox changes
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
    
    function addFolder() {
        const folderName = document.getElementById('folderName').value.trim();
    
        if (folderName === '') {
            alert('Please enter a folder name.');
            return;
        }
    
        const folderList = document.getElementById('folderList');
        const folderItem = document.createElement('li');
        folderItem.textContent = folderName;
        folderList.appendChild(folderItem);
    
        // Clear the input field
        document.getElementById('folderName').value = '';
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
    
    function addToFolder() {
        alert("Add logic to put cards into folder");
    }
      );
    });
  
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
  
  // Function to toggle between tabs
function showTab(tabName) {
  var i, tabcontent;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}

// Function to create a new folder
function createFolder() {
  var folderName = document.getElementById("newFolderName").value;
  // Logic to create and display the new folder
}

// Add event listener for tab clicks
document.querySelectorAll('nav ul li a').forEach(tab => {
  tab.addEventListener('click', function() {
    showTab(this.getAttribute('href').substring(1));
  });
});

const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
  // Create the main application window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load the HTML file
  mainWindow.loadFile('app.html');

  // Handle when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });
  
    mainWindow.loadFile('app.html');
  
    // Add your JavaScript functions here
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.executeJavaScript(
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
    
    // Function to create a new folder
    function createFolder() {
        const folderName = document.getElementById('folderName').value;
        
        // Check if folderName is not empty
        if (folderName.trim() === '') {
            alert('Please enter a folder name.');
            return;
        }
    
        // Create a new folder list item
        const folderListItem = document.createElement('li');
        folderListItem.textContent = folderName;
    
        // Append the folder list item to the folder list
        const folderList = document.getElementById('folderList');
        folderList.appendChild(folderListItem);
    
        // Clear the folder name input field
        document.getElementById('folderName').value = '';
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
        document.getElementById('color').selectedIndex = 0; // Reset the color dropdown to its default option
        document.getElementById('manaCost').value = '';
    }
    // Add listeners for checkbox changes
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
    
    function addFolder() {
        const folderName = document.getElementById('folderName').value.trim();
    
        if (folderName === '') {
            alert('Please enter a folder name.');
            return;
        }
    
        const folderList = document.getElementById('folderList');
        const folderItem = document.createElement('li');
        folderItem.textContent = folderName;
        folderList.appendChild(folderItem);
    
        // Clear the input field
        document.getElementById('folderName').value = '';
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
    
    function addToFolder() {
        alert("Add logic to put cards into folder");
    }
      );
    });
  
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
  
  // Function to toggle between tabs
function showTab(tabName) {
  var i, tabcontent;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}

// Function to create a new folder
function createFolder() {
  var folderName = document.getElementById("newFolderName").value;
  // Logic to create and display the new folder
}

// Add event listener for tab clicks
document.querySelectorAll('nav ul li a').forEach(tab => {
  tab.addEventListener('click', function() {
    showTab(this.getAttribute('href').substring(1));
  });
});
