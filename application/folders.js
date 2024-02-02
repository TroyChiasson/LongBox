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

// Function to toggle between tabs
function showTab(tabName) {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
  }