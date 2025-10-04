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
  document.getElementById("display-grid").style.display = "grid";
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

function eventCriteriaDropdownClicked(event) {
  if (event.target.parentNode.classList.contains('visible'))
    event.target.parentNode.classList.remove('visible');
  else
  event.target.parentNode.classList.add('visible');
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

function filterCheckboxSelected(event) {
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

  // Update the dropdown
  event.target.parentElement.parentElement.parentElement.firstElementChild.innerText = textToSetInDropdown; //Add the text to the dropdown
  event.target.parentElement.parentElement.parentNode.classList.remove('visible') // Close the dropdown

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

  // Filter datasets to only include lines matching the search word
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
    document.getElementById("display-grid").style.display = "grid";
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

function eventInputDateChanged(event, comingFrom) { // This can be done from either the input form or the output table
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

  // Find the row with that date to get the corresponding location and event values
  var result = helperReturnRowThatMatchesDate(datasetArray, dateToSearchFor, comingFrom);
  
  // Set found values as the user's input
  if (result == "Date not found.") { // If this is a new date, then insert new line
    // Get default values for location and event from the file
    var defaultValues = helperSetBeaklineCharacter(datasetArray[datasetArray.length-2][2], "<br>tobackslashn").split("\n");
    var locationToDisplay = defaultValues[0];
    var eventLinesToDisplay = defaultValues.slice(2).join("\n");

    // Display the default location and event values
    displayUserInputForm(dateToSearchFor, locationToDisplay, eventLinesToDisplay);
  
  } else { // If this is an existing date, then update
    displayUserInputForm(result[0], result[1], helperSetBeaklineCharacter(result[2], "<br>tobackslashn"));
  }
}
