// DEFINE GLOBAL VARIABLES

// Input from excel file
var datasetArray = []; // Data from excel file, program never changes it
var datasetBeforeKeywordFilter = []; // Holds the data to display in the output before the keyword filter is applied
var datasetAfterKeywordFilter = []; // Holds the data to display in the output after the keyword filter is applied
var allDropdownValues = [[], [], []]; // Holds the values of the selected checkboxes from Time, Locations, and Events dropdowns
var allDisplayOptions = []; // All Display Options in the Display Options dropdown
var citiesListedInLocationDropdown = []; // All city names in the Location dropdown. Not used currently, and it can be integrated in the allDropdownValues at some point.

// Input from webpage
var selectedDropdownValues = [[], [], []]; // Holds the values of the selected checkboxes from Time, Locations, and Events dropdowns
var selectedDisplayOption; // Value of the user selected radio button
var searchWord = ""; // Value of the user entered keyword

// DEFINE RESPONSE FUNCTIONS

function eventUploadButtonClicked(event) {
  // Get file content
  readContentFromFile(event);
  
  // Enable HTML elements again
  document.getElementById("button-modetoggle").removeAttribute("disabled");
  document.getElementById("filter-grid").style.display = "grid";
  document.getElementById("output-table").style.display = "grid";
}

function eventDarkModeButtonClicked() {
  // If dark theme was not set, then set it
  if (darkModeBtnValue = document.getElementById("button-themetoggle").value == "Switch to Dark Theme") {
    document.getElementById("textbox-password").classList.add("darkclass");
    document.getElementById("label-button-upload").classList.add("darkclass");
    document.getElementById("button-themetoggle").value = "Switch to Light Theme";
    document.getElementById("button-themetoggle").classList.add("darkclass");
    document.getElementById("button-modetoggle").classList.add("darkclass");
    document.getElementById("select-displayoption").classList.add("darkclass");
    document.getElementById("yearDropdownDiv").classList.add("darkclass");
    document.getElementById("locationDropdownDiv").classList.add("darkclass");
    document.getElementById("eventDropdownDiv").classList.add("darkclass");
    document.getElementById("textbox-keyword").classList.add("darkclass");
    document.getElementById("button-displaytable").classList.add("darkclass");
    document.getElementById("input-date").classList.add("darkclass");
    document.getElementById("input-location").classList.add("darkclass");
    document.getElementById("input-events").classList.add("darkclass");
    document.getElementById("button-submit").classList.add("darkclass");
    document.getElementById("body").classList.add("darkclass");
  // otherwise, unset it
  } else {
    document.getElementById("textbox-password").classList.remove("darkclass");
    document.getElementById("label-button-upload").classList.remove("darkclass");
    document.getElementById("button-themetoggle").value = "Switch to Dark Theme";
    document.getElementById("button-themetoggle").classList.remove("darkclass");
    document.getElementById("button-modetoggle").classList.remove("darkclass");
    document.getElementById("select-displayoption").classList.remove("darkclass");
    document.getElementById("yearDropdownDiv").classList.remove("darkclass");
    document.getElementById("locationDropdownDiv").classList.remove("darkclass");
    document.getElementById("eventDropdownDiv").classList.remove("darkclass");
    document.getElementById("textbox-keyword").classList.remove("darkclass");
    document.getElementById("button-displaytable").classList.remove("darkclass");
    document.getElementById("input-date").classList.remove("darkclass");
    document.getElementById("input-location").classList.remove("darkclass");
    document.getElementById("input-events").classList.remove("darkclass");
    document.getElementById("button-submit").classList.remove("darkclass");
    document.getElementById("body").classList.remove("darkclass");
  }
}

function eventDisplayOptionSelected() {
    // Gather user inputs
    retrieveDataFromTopPane();

    // Check which display option user chose in order to enable or disable the Display button
    if (selectedDisplayOption.includes("List")) {
      document.getElementById("button-displaytable").removeAttribute("disabled"); // Enable Display button
    } else {
      document.getElementById("button-displaytable").setAttribute("disabled", true); // Disable Display button
    }
    
    // Check which display option user chose in order to call the corresponding function
    if (selectedDisplayOption == "List: Excel File") {
      retrieveDataForUploadedFile();
    } else if (selectedDisplayOption == "List: All Lines") {
      retrieveDataForListTable();
    } else if (selectedDisplayOption == "List: Event Lines") {
      retrieveDataForListTable();
    } else if (selectedDisplayOption == "GroupBy: Location") {
      retrieveDataforGroupByLocationTable();
    } else if (selectedDisplayOption.includes("Summary:")) {
      retrieveDataforSummaryTable();
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

function eventDisplayButtonClicked() {
  // Gather user inputs
  retrieveDataFromTopPane();

  // Check which display option user chose 
  if (selectedDisplayOption == "List: Excel File") {
    retrieveDataForUploadedFile();
  } else if (selectedDisplayOption == "List: All Lines") {
    retrieveDataForListTable();
  } else if (selectedDisplayOption == "List: Event Lines") {
    retrieveDataForListTable();
  } else if (selectedDisplayOption == "GroupBy: Location") {
    retrieveDataforGroupByLocationTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventKeywordEntered() {
  // Gather keyword
  retrieveDataFromTopPane();

  // Retrieve data which then calls output display
  if (selectedDisplayOption == "List: Excel File" || selectedDisplayOption == "List: All Lines" || selectedDisplayOption == "List: Event Lines") {
    retrieveDataForListTable();
  }

}

function eventCheckboxSelected(event) {
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
}

function eventAppModeButtonClicked() {
  if (darkModeBtnValue = document.getElementById("button-modetoggle").value == "Switch to Write Mode") { 
    // Switch to Write mode
    // Update element visibility
    document.getElementById("filter-grid").style.display = "none";
    document.getElementById("output-table").style.display = "none";
    document.getElementById("input-grid").style.display = "grid";

    // Update element visibility
    document.getElementById("button-modetoggle").value = "Switch to Read Mode";
    document.getElementById("input-date").valueAsDate = new Date((new Date(datasetArray[0][0])).setDate((new Date(new Date(datasetArray[0][0]))).getDate() + 1));
    document.getElementById("input-location").value = "Washington DC_USA";
    document.getElementById("input-events").value = "#Workout.\n";

  } else { 
    // Switch to Read mode
    // Update element visibility
    document.getElementById("filter-grid").style.display = "grid";
    document.getElementById("output-table").style.display = "grid";
    document.getElementById("input-grid").style.display = "none";

    // Update element visibility
    document.getElementById("button-modetoggle").value = "Switch to Write Mode";
  }
}

function eventSaveButtonClicked() {
  saveContentToFile();
}

function eventInputDateChanged(event) {
  // Find the row with that date to get the corresponding location and event values to then set them in the user's input
  var result = helperReturnRowThatMatchesDate(datasetArray, event.target.value)
  if (result == "Date not found.") {
    updateUserInputForm("Washington DC_USA", "#Workout.\n");
  } else {
    var retrievedEvent = helperSetBeaklineCharacter(result[2], "<br>tobackslashn");
    updateUserInputForm(result[1], retrievedEvent);
  }
}