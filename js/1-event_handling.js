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
var datasetLoaded = false; // Flag to indicate if dataset has been loaded
var themeMode; // Used to set the dark mode

// DEFINE RESPONSE FUNCTIONS

function eventFileHandlingButtonClicked(event) {
  if (!datasetLoaded) { //If dataset has not been loaded yet, then treat button click as file upload
    // Get file content
    readFileAndValidate(event);
    
    // Enable HTML elements again
    document.getElementById("select-displayoption").removeAttribute("disabled");
    document.querySelectorAll('.select-filter').forEach(el => el.disabled = false);
    document.getElementById("textbox-keyword").removeAttribute("disabled");
    document.getElementById("output-list").style.display = "grid";

    // Change button functionality from Upload File to Save To File
    document.getElementById("button-filehandling").setAttribute("type", "button");
    document.getElementById("button-filehandling").setAttribute("onclick", "eventFileHandlingButtonClicked()");
    document.getElementById("button-filehandling").removeAttribute("name");
    document.getElementById("button-filehandling").removeAttribute("accept");
    document.getElementById("button-filehandling").removeAttribute("onchange");
    document.getElementById("button-filehandling-id").innerText = "Save To File";
    datasetLoaded = true;

  } else { // Otherwise, consider button click as used for Save To File
    // Save content to file
    saveContentToFile();

    // Refresh the output display after saving the new event
    document.getElementById("select-displayoption").value = "List: All Lines";
    eventDisplayOptionSelected(); 

  }
}

function eventThemeCheckboxChanged() {
  // If dark theme is set, then change theme to light
  if (themeMode == "darkMode") {
    themeMode = "lightMode";
    document.getElementById("body").classList.add("lightmode");
  } else { // otherwise, change to dark mode
    themeMode = "darkMode";
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
  if (selectedDisplayOption.includes("Enter: New Day")) {
    // Update element visibility/activity
    document.getElementById("select-year").setAttribute("disabled", "true");
    document.getElementById("select-location").setAttribute("disabled", "true");
    document.getElementById("textbox-keyword").setAttribute("disabled", "true");
    document.getElementById("select-displayoption").value = "Enter: New Day";
    document.getElementById("input-form").style.display = "flex";
    document.getElementById("output-list").style.display = "none";

    // Retrieve default values for date, location, country, and event from file
    retrieveDefaultInputValues();

    // display the values in the input form
    displayDataInUserInputForm(defaultInputValues[0], defaultInputValues[1], defaultInputValues[3]);
  } else {
    // Update element visibility
    document.getElementById("select-year").removeAttribute("disabled");
    document.getElementById("select-location").removeAttribute("disabled");
    document.getElementById("textbox-keyword").removeAttribute("disabled");
    document.getElementById("input-form").style.display = "none";
    document.getElementById("output-list").style.display = "grid";

    if (selectedDisplayOption.includes("List:")) {
      retrieveDataForListView();
    } else if (selectedDisplayOption.includes("GroupBy:")) {
      retrieveDataForGroupByTable();
    } else if (selectedDisplayOption.includes("Summary:")) {
      retrieveDataforSummaryTable();
    }
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

function eventInputDateChanged(event, comingFrom) { // This can happen either from the input form or the output table

  // Set the date to search for in the right format 
  let dateToSearchFor;
  if (comingFrom == "inputForm") { 
    dateToSearchFor = event.target.value; // Get the date from the input type=date element
  } else if (comingFrom == "outputTable") { 
    dateToSearchFor = event.target.innerText; // Get the date from the clicked element
    
    // Update element visibility/activity
    document.getElementById("select-year").setAttribute("disabled", "true");
    document.getElementById("select-location").setAttribute("disabled", "true");
    document.getElementById("textbox-keyword").setAttribute("disabled", "true");
    document.getElementById("select-displayoption").value = "Enter: New Day";
    document.getElementById("input-form").style.display = "flex";
    document.getElementById("output-list").style.display = "none";
  } else {
    // This scenario does not exist, keeping this here for future-proofing
    console.log("incorrect input");
  }

  // Check if date already exists in dataset and if so retrieve its values
  var result = helperReturnRowThatMatchesDate(datasetArray, dateToSearchFor, comingFrom);
  
  // Update the input form with either the default values (if date exists) or empty values (if date does not exist)
  if (result != "Date not found.") { // If this is an existing date, then update the input form with its values
    displayDataInUserInputForm(result[0], result[1], result[2]);
  } else {  //Otherwise, display default values
    // Get default values for location and event from the file
    var locationToDisplay = defaultInputValues[1];
    var eventLinesToDisplay = defaultInputValues[3];

    // Display the default location and event values
    displayDataInUserInputForm(dateToSearchFor, locationToDisplay, eventLinesToDisplay);
  }
}
