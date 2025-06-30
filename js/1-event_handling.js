// DEFINE GLOBAL VARIABLES

// Input from excel file
var datasetArray = []; // Data from excel file, program never changes it
var datasetArrayForDisplay = []; // Holds the data to display in the output after the filter is applied
var allDropdownValues = [[], [], []]; // Holds the values of the selected checkboxes from Time, Locations, and Events dropdowns
var allDisplayOptions = []; // All Display Options in the Display Options dropdown
var defaultCountrySuffix; // Holds the default country name to append to locations when the _country suffix is not entered
                          // It's also the value that gets checked for before incrementing the stateName variable

// Input from webpage
var selectedDropdownValues = [[], [], []]; // Holds the values of the selected checkboxes from Time, Locations, and Events dropdowns
var selectedDisplayOption; // Value of the user selected drop down
var searchWord = ""; // Value of the user entered keyword

// DEFINE RESPONSE FUNCTIONS

function eventUploadButtonClicked(event) {
  // Get file content
  readContentFromFile(event);
  
  // Enable HTML elements again
  document.getElementById("button-modetoggle").removeAttribute("disabled");
  document.getElementById("filter-grid").style.display = "grid";
  document.getElementById("output-table").style.display = "grid";
  document.getElementById("switch-mode-section").style.display = "grid";
}

function eventDarkModeButtonClicked() {
  // If dark theme was not set, then set it
  if (darkModeBtnValue = document.getElementById("label-button-theme").innerText == "Switch to Dark Theme") {
    document.getElementById("label-button-theme").innerText = "Switch to Light Theme";
    document.getElementById("body").classList.remove("lightmode");
  // otherwise, unset it
  } else {
    document.getElementById("label-button-theme").innerText = "Switch to Dark Theme";
    document.getElementById("body").classList.add("lightmode");
  }
}

function eventCriteriaDropdownClicked(event) {
  if (datasetArray.length > 0){ // That means the excel file has been uploaded
    if (event.target.parentNode.classList.contains('visible'))
      event.target.parentNode.classList.remove('visible');
    else
    event.target.parentNode.classList.add('visible');
  }
}

function eventDisplayOptionSelected() {
  // Clear the search word text box (needed in order to optimize search speed)
  //document.getElementById('textbox-keyword').value = '';

  // Gather user inputs
  retrieveDataFromTopPane();

  // Filter dataset to only include lines matching from the search word
  updateDataSetToMatchSearchCriteria(); 

  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListTable();
  } else if (selectedDisplayOption.includes("GroupBy:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventCheckboxSelected(event) {
  // Clear the search word text box (to avoid having to search for a keyword in order to optimize search speed)
  document.getElementById('textbox-keyword').value = '';
  
  // To simplify the code, I will retrieve the values from all checkboxes and even other inputs, rather than just the checkbox that the user checked
  retrieveDataFromTopPane();

  // Identify which dropdown the user is on
  var innerTextOfDropdown = event.target.parentElement.parentElement.parentElement.getAttribute("id"); // Get display text of the checked dropdown
  var dropdownNumber; // Used to either hold 0 (for Year), 1 (for Location), or 2 (for Event);
  var unitToUse = ["Year", "Location", "Event"]; // Used when setting the dropdown text to remove reptitive code
  if (innerTextOfDropdown.includes("year")) {
    dropdownNumber = 0;
  } else if (innerTextOfDropdown.includes("location")) {
    dropdownNumber = 1;
  } else if (innerTextOfDropdown.includes("event")) {
    dropdownNumber = 2;
  }

  // Check the number of selections made and then create the text to later add to the dropdown
  var numberOfCheckedboxes = selectedDropdownValues[dropdownNumber].length; // Used to get the number of checked boxes
  var totalNumberofCheckboxes = allDropdownValues[dropdownNumber].length; // Used to get the number of all checkboxes to determine if they are all selected or only some
  var textToSetInDropdown = ""; // Used to change the dropdown text to
  if (numberOfCheckedboxes == 1) { // Meaning only 1 checkbox was selected
    textToSetInDropdown = selectedDropdownValues[dropdownNumber]; // Meaning enter the text from the selected checkbox
  } else if (numberOfCheckedboxes == totalNumberofCheckboxes) { // Meaning all checkboxes are selected
    textToSetInDropdown = "All " + unitToUse[dropdownNumber] + "s";
  } else {
    textToSetInDropdown = "Multiple " + unitToUse[dropdownNumber] + "s";
  }

  // Update the dropdown value
  event.target.parentElement.parentElement.parentElement.firstElementChild.innerText = textToSetInDropdown;

  // Filter datasets to only include lines matching from the 3 dropdown selections
  updateDataSetToMatchSearchCriteria(); 

  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListTable();
  } else if (selectedDisplayOption.includes("GroupBy:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventKeywordEntered() {
  // Gather user inputs
  retrieveDataFromTopPane();

  // Filter datasets to only include lines matching from the search word
  updateDataSetToMatchSearchCriteria(); 

  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListTable();
  } else if (selectedDisplayOption.includes("GroupBy:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventAppModeButtonClicked() {
  if (darkModeBtnValue = document.getElementById("label-button-mode").innerText == "Switch to Write Mode") { 
    // Switch to Write mode
    // Update element visibility
    document.getElementById("filter-grid").style.display = "none";
    document.getElementById("output-table").style.display = "none";
    document.getElementById("input-grid").style.display = "grid";

    // Get default values for location, country to append, and event, from the file
    var defaultValues = helperSetBeaklineCharacter(datasetArray[datasetArray.length-2][2], "<br>tobackslashn");
    defaultValues = defaultValues.split("\n");
    var defaultLocation = defaultValues[0]; // First line has the locations
    defaultCountrySuffix = defaultValues[1]; // Second line has the default country suffix
    var defaultEventLine = defaultValues.slice(2).join("\n"); // Afterwards it's the default events

    // Display the default location and event values
    document.getElementById("label-button-mode").innerText = "Switch to Read Mode";
    document.getElementById("input-date").valueAsDate = new Date((new Date(datasetArray[0][0])).setDate((new Date(new Date(datasetArray[0][0]))).getDate() + 1));
    updateUserInputForm(defaultLocation, defaultEventLine);
  } else { 
    // Switch to Read mode
    // Update element visibility
    document.getElementById("filter-grid").style.display = "grid";
    document.getElementById("output-table").style.display = "grid";
    document.getElementById("input-grid").style.display = "none";

    // Update element values
    document.getElementById("label-button-mode").innerText = "Switch to Write Mode";
  }
}

function eventSaveButtonClicked() {
  saveContentToFile();
}

function eventInputDateChanged(event) {
  // Find the row with that date to get the corresponding location and event values to then set them in the user's input
  var result = helperReturnRowThatMatchesDate(datasetArray, event.target.value)
  if (result == "Date not found.") { // If this is a new date, then insert new line
    // Get default values for location and event from the file
     var defaultValues = helperSetBeaklineCharacter(datasetArray[datasetArray.length-2][2], "<br>tobackslashn");
    defaultValues = defaultValues.split("\n");
        var locationToDisplay = defaultValues[0];
    var eventLinesToDisplay = defaultValues.slice(2).join("\n");

    // Display the default location and event values
    updateUserInputForm(locationToDisplay, eventLinesToDisplay);
  } else { // If this is an existing date, then update
    var retrievedEvent = helperSetBeaklineCharacter(result[2], "<br>tobackslashn");
    updateUserInputForm(result[1], retrievedEvent);
  }
}
