// DEFINE GLOBAL VARIABLES

// Input from excel file
var datasetArray = []; // Data from excel file, program never changes it
var allDisplayOptions = []; // All Display Options in the Display Options dropdown
var defaultInputValues = []; // Holds the default values for date, location, country to append, and event, which will be used later in the app

// Input from webpage
var datasetArrayForDisplay = []; // Holds the data to display in the output after the filter is applied
var allDropdownValues = [[], [], []]; // Holds the values of all the checkboxes from Time, Locations, and Events dropdowns
var selectedDropdownValues = [[], [], []]; // Holds the values of the selected checkboxes from Time, Locations, and Events dropdowns
var selectedDisplayOption; // Value of the user selected drop down
var searchWord = ""; // Value of the user entered keyword
var themeMode = "darkMode"; // Set default value to dark mode
var appMode = "readMode"; // Set default value to read mode


// DEFINE RESPONSE FUNCTIONS

function eventUploadButtonClicked(event) {
  // Get file content
  readFileAndValidate(event);
  
  // Enable HTML elements again
  document.getElementById("button-modetoggle").removeAttribute("disabled");
  document.getElementById("filter-grid").style.display = "grid";
  document.getElementById("displayoptions-grid").style.display = "grid";
  document.getElementById("output-grid").style.display = "grid";
  document.getElementById("switch-mode-section").style.display = "grid";
}

function eventThemeButtonClicked() {
  // If dark theme is set, then change theme to light
  if (themeMode == "darkMode") {
    themeMode = "lightMode";
    document.getElementById("label-button-theme").innerText = "Switch to Dark Theme";
    document.getElementById("body").classList.add("lightmode");
  } else { // otherwise, change to dark mode
    themeMode = "darkMode";
    document.getElementById("label-button-theme").innerText = "Switch to Light Theme";
    document.getElementById("body").classList.remove("lightmode");
  }
}

function eventDisplayOptionSelected() {
  // Clear the search word text box (to avoid having to search for a keyword in order to optimize search speed)
  document.getElementById('textbox-keyword').value = '';

  // Gather user inputs
  retrieveDataFromTopPane();

  // Filter dataset to only include lines matching from the search word
  updateDataSetToMatchSearchCriteria(); 

  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListView();
  } else if (selectedDisplayOption.includes("GroupBy:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventKeywordEntered() {
  // Gather user inputs
  retrieveDataFromTopPane();

  // Filter datasets to only include lines matching the search word
  updateDataSetToMatchSearchCriteria(); 

  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListView();
  } else if (selectedDisplayOption.includes("GroupBy:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventAppModeButtonClicked() {
  if (appMode == "readMode") { 
    // Switch to Write mode
    appMode = "writeMode";

    // Update element visibility
    document.getElementById("filter-grid").style.display = "none";
    document.getElementById("output-grid").style.display = "none";
    document.getElementById("input-grid").style.display = "grid";
    document.getElementById("label-button-mode").innerText = "Switch to Read Mode";
    document.getElementById("select-displayoption").setAttribute("disabled", "true");

    // Retrieve default values for date, location, country, and event from file
    retrieveDefaultInputValues();

    // display the values in the input form
    displayUserInputForm(defaultInputValues[0], defaultInputValues[1], defaultInputValues[3]);
  } else { 
    // Switch to Read mode
    appMode = "readMode";

    // Update element visibility
    document.getElementById("filter-grid").style.display = "grid";
    document.getElementById("displayoptions-grid").style.display = "grid";
    document.getElementById("output-grid").style.display = "grid";
    document.getElementById("input-grid").style.display = "none";

    // Update element values
    document.getElementById("select-displayoption").removeAttribute("disabled");
    document.getElementById("label-button-mode").innerText = "Switch to Write Mode";
  }
}

function eventSaveButtonClicked() {
  saveContentToFile();
}

function eventInputDateChanged(event, comingFrom) { // This can happen either from the input form or the output table
  // Update element visibility for write mode
  document.getElementById("filter-grid").style.display = "none";
  document.getElementById("output-grid").style.display = "none";
  document.getElementById("input-grid").style.display = "grid";
  document.getElementById("label-button-mode").innerText = "Switch to Read Mode";
  document.getElementById("select-displayoption").setAttribute("disabled", "true");
  
  // Set the date to search for in the right format 
  let dateToSearchFor;
  if (comingFrom == "inputForm") { 
    dateToSearchFor = event.target.value; // Get the date from the input type=date element
  } else if (comingFrom == "outputTable") { 
    dateToSearchFor = event.target.innerText; // Get the date from the clicked element
    eventAppModeButtonClicked();
  } else {
    // This scenario does not exist, keeping this here for future-proofing
  }

  // Check if date already exists in dataset and if so retrieve its values
  var result = helperReturnRowThatMatchesDate(datasetArray, dateToSearchFor, comingFrom);
  
  // Update the input form with either the default values (if date exists) or empty values (if date does not exist)
  if (result != "Date not found.") { // If this is an existing date, then update the input form with its values
    displayUserInputForm(result[0], result[1], result[2]);
  } else {  //Otherwise, display default values
    // Get default values for location and event from the file
    var locationToDisplay = defaultInputValues[1];
    var eventLinesToDisplay = defaultInputValues[3];

    // Display the default location and event values
    displayUserInputForm(dateToSearchFor, locationToDisplay, eventLinesToDisplay);
  }
}
