// DEFINE GLOBAL VARIABLES

// Input from excel file
var datasetFromExcel = []; // Data from excel file, program never changes it
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
  retrieveFileContent(event);
  
  // Enable HTML elements again
  document.getElementById("button-displaytable").removeAttribute("disabled");
  document.getElementById("select-displayoption").removeAttribute("disabled");
  document.getElementById("textbox-keyword").removeAttribute("disabled");
}

function eventCriteriaDropdownClicked(event) {
  if (datasetFromExcel.length > 0){ // That means the excel file has been uploaded
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
    retrieveExcelFileTable();
  } else if (selectedDisplayOption == "List: All Lines") {
    retrieveDataForLinesTable();
  } else if (selectedDisplayOption == "List: Event Lines") {
    retrieveDataForLinesTable();
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
    retrieveDataForLinesTable();
  }

}

function eventDarkModeButtonClicked() {
  // If dark mode was not set, then set it
  if (darkModeBtnValue = document.getElementById("button-darktoggle").value == "Dark Mode: Off") {
    document.getElementById("button-darktoggle").value = "Dark Mode: On";
    document.getElementById("button-darktoggle").classList.add("darkclass");
    document.getElementById("button-upload").classList.add("darkclass");
    document.getElementById("yearDropdownDiv").classList.add("darkclass");
    document.getElementById("locationDropdownDiv").classList.add("darkclass");
    document.getElementById("eventDropdownDiv").classList.add("darkclass");
    document.getElementById("select-displayoption").classList.add("darkclass");
    document.getElementById("button-displaytable").classList.add("darkclass");
    document.getElementById("textbox-keyword").classList.add("darkclass");
    document.getElementById("body").classList.add("darkclass");
  // otherwise, unset it
  } else {
    document.getElementById("button-darktoggle").value = "Dark Mode: Off";
    document.getElementById("button-darktoggle").classList.remove("darkclass");
    document.getElementById("button-upload").classList.remove("darkclass");
    document.getElementById("yearDropdownDiv").classList.remove("darkclass");
    document.getElementById("locationDropdownDiv").classList.remove("darkclass");
    document.getElementById("eventDropdownDiv").classList.remove("darkclass");
    document.getElementById("select-displayoption").classList.remove("darkclass");
    document.getElementById("button-displaytable").classList.remove("darkclass");
    document.getElementById("textbox-keyword").classList.remove("darkclass");
    document.getElementById("body").classList.remove("darkclass");
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