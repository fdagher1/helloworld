// DEFINE GLOBAL VARIABLES

// Input from excel file
var datasetArray = []; // Data from excel file, program never changes it
var allDropdownValues = [[], [], [], []]; // Holds the values of all the checkboxes from Time, Locations, Events, and Thoughts dropdowns
var allDisplayOptions = []; // All Display Options in the Display Options dropdown
var defaultInputValues = []; // Holds the default values for date, location, country to append, and event, which will be used later in the app

// Input from webpage
var datasetArrayForDisplay = []; // Holds the data to display in the output after the filter is applied
var selectedDropdownValues = []; // Holds the values of the selected checkboxes from Time, Locations, Events, and Thoughts dropdowns
var selectedDisplayOption; // Value of the user selected drop down
var searchWord = ""; // Value of the user entered keyword
var datasetLoaded = false; // Flag to indicate if dataset has been loaded
var themeMode = "darkMode"; // Default to dark mode
let valueToStore = ""; // Holds the value of the currently active editable output cell. 

// DEFINE RESPONSE FUNCTIONS

function eventAppLoaded() {
  // Set theme based on time of day
  const h = new Date().getHours();
  // Define day as 6:00-17:59, night 18:00-5:59
  if (h >= 8 && h < 18) {
    eventThemeCheckboxChanged();
  }
}

function eventFileLoadSaveClicked(event) {
  if (!datasetLoaded) { //FILE LOAD
    // Get file content
    readFileAndDisplay(event);
    
    // Enable HTML elements again
    document.getElementById("select-displayoption").removeAttribute("disabled");
    document.querySelectorAll('.select-filter').forEach(el => el.disabled = false);
    document.getElementById("textbox-keyword").removeAttribute("disabled");
    document.getElementById("output-list").style.display = "grid";

    // Change button functionality from Upload File to Save To File
    document.getElementById("button-filehandling").setAttribute("type", "button");
    document.getElementById("button-filehandling").setAttribute("onclick", "eventFileLoadSaveClicked()");
    document.getElementById("button-filehandling").removeAttribute("name");
    document.getElementById("button-filehandling").removeAttribute("accept");
    document.getElementById("button-filehandling").removeAttribute("onchange");
    document.getElementById("button-filehandling-id").innerText = "Save To File";
    datasetLoaded = true;

    clearErrorMessages(); // Clear error messages in case of any from previous save attemps attemps

  } else { // FILE SAVE
    // Save content to file
    saveContentToFile();
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

function eventFilterOrDisplayOptionChanged(whatChanged) {
  // Clear the search word text box (to avoid having to search for a keyword in order to optimize search speed)
  document.getElementById('textbox-keyword').value = '';
 
  // Enable the HTML element (in case they were disabled or hidden)
  document.getElementById("select-year").removeAttribute("disabled");
  document.getElementById("select-location").removeAttribute("disabled");
  document.getElementById("textbox-keyword").removeAttribute("disabled");
  document.getElementById("button-filehandling").removeAttribute("disabled");
  document.getElementById("output-list").style.display = "grid";

  // Gather user inputs (needed for the below if statements)
  retrieveDataFromTopPane();

  // Depending on the combination of display option and filter chosen, change the display option or keyword search
  if (selectedDisplayOption.includes("List") && whatChanged == 'event') {
    if (document.getElementById("select-event").value.includes("All")) {
      document.getElementById("select-displayoption").value = "List: Events & Thoughts";  
    } else {
      document.getElementById("select-displayoption").value = "List: Events (Tagged)";
    } 
  }
  if (selectedDisplayOption.includes("List") && whatChanged == 'thought') {
    if (document.getElementById("select-thought").value.includes("All")) {
      document.getElementById("select-displayoption").value = "List: Events & Thoughts";  
    } else {
      document.getElementById("select-displayoption").value = "List: Thoughts (Tagged)";
    } 
  }
  if (selectedDisplayOption == "List: Events & Thoughts (today)") { 
    // Get today's date and add it to the search criteria, so that the output will only show lines from today
    var todayDateString = (new Date().getMonth() + 1).toString().padStart(2, '0') + "/" + new Date().getDate().toString().padStart(2, '0');
    document.getElementById('textbox-keyword').value = todayDateString;
  }
  if (selectedDisplayOption != "List: Events & Thoughts") {
    document.getElementById("button-filehandling").disabled = true;
  }

  // Gather user inputs again since displayoption or keyword may have changed in above if statements
  retrieveDataFromTopPane();

  // Filter dataset to only include lines matching search criteria
  updateDataSetToMatchSearchCriteria();

  // Update the output
  routeOutputDisplay(); 
}

function eventKeywordEntered() {
  // Gather user inputs
  retrieveDataFromTopPane();

  // Filter datasets to only include lines matching the search word
  updateDataSetToMatchSearchCriteria(); 

  // Update the output
  routeOutputDisplay();

}

function cellValueChanged(divInnerText) {
  valueToStore = helperNormalizeEditableCellValue(divInnerText);
}

function cellDeselected(deselectedCellDate, deselectedCellColumnIndex) {
  deselectedCellDate = deselectedCellDate.slice(0,15);
  
  if (valueToStore) { // If the cell was edited
    // Update datasetArray accordingly
    for (var i=0; i<datasetArray.length; i++) {
      if (datasetArray[i][0] == deselectedCellDate) {
        datasetArray[i][deselectedCellColumnIndex] = valueToStore;
        break;
      }
    }
    // Update datasetArrayForDisplay accordingly
    for (var i=0; i<datasetArrayForDisplay.length; i++) {
      if (datasetArray[i][0] == deselectedCellDate) {
        datasetArrayForDisplay[i][deselectedCellColumnIndex] = valueToStore;
        break;
      }
    }
  }

  valueToStore = "";
}

function routeOutputDisplay() {
  // Check which display option user chose in order to call the corresponding function
  if (selectedDisplayOption == "List: Events & Thoughts") {
    retrieveDataForListView(true);
  } else if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListView(false);
  } else if (selectedDisplayOption.includes(" grouping of days")) {
    retrieveDataForGroupByLocationTable();
  } else if (selectedDisplayOption.includes("Monthly grouping ")) {
    retrieveDataForGroupByMonthTable();
  } else if (selectedDisplayOption.includes("Summary(ev):")) {
    retrieveDataforSummaryTable("event");
  } else if (selectedDisplayOption.includes("Summary(th):")) {
    retrieveDataforSummaryTable("thought");
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
  eventAppLoaded();
});
