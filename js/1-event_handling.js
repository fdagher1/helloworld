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
var themeMode = "darkMode"; // Default to dark mode
let activeEditableOutputCell = null; // Holds the currently active editable output cell, if any
let activeEditableOutputCellValue = ""; // Holds the value of the currently active editable output cell. 
let datasetDisplayRowSourceIndexMap = []; // Map to track the source row index for each displayed row in datasetArrayForDisplay

// DEFINE RESPONSE FUNCTIONS

function eventAppLoaded() {
  
  // SET THE THEME BASED ON TIME OF DAY
  const h = new Date().getHours();
  // Define day as 6:00-17:59, night 18:00-5:59
  if (h >= 8 && h < 18) {
    eventThemeCheckboxChanged();
  }
}

function eventFileLoadSaveClicked(event) {
  if (!datasetLoaded) { //If dataset has not been loaded yet, then treat button click as file upload
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

  } else { // Otherwise, consider button click as used for Save To File
    // Save content to file
    validateThenSaveContentToFile();
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

  // Gather user inputs
  retrieveDataFromTopPane();
 
  // Update element visibility
  document.getElementById("select-year").removeAttribute("disabled");
  document.getElementById("select-location").removeAttribute("disabled");
  document.getElementById("textbox-keyword").removeAttribute("disabled");
  document.getElementById("output-list").style.display = "grid";

  // If the user selected an event then change the display mode to tagged lines only 
  if (whatChanged == 'event' && selectedDisplayOption === "List: Events & Thoughts") {
    document.getElementById("select-displayoption").value = "List: Events (Tagged)";

    // Gather user inputs again since display option changed
    retrieveDataFromTopPane();
  }

  // Filter dataset to only include lines matching from the search word
  updateDataSetToMatchSearchCriteria(); 

  if (selectedDisplayOption.includes("List:")) {
    retrieveDataForListView();
  } else if (selectedDisplayOption.includes("Number of Days:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  } else if (selectedDisplayOption.includes("Places Visited By Month:")) {
    retrieveDataForPlacesVisitedByMonth();
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
  } else if (selectedDisplayOption.includes("Number of Days:")) {
    retrieveDataForGroupByTable();
  } else if (selectedDisplayOption.includes("Summary:")) {
    retrieveDataforSummaryTable();
  }
}

function eventOutputCellClicked(event, rowIndex, columnIndex, columnName, sourceRowIndex = rowIndex) {
  if (selectedDisplayOption !== "List: Events & Thoughts") {
    return;
  }

  const clickedElement = event.currentTarget;

  // Save the value of the previously active editable output cell if it exists and is different from the newly clicked cell
  if (activeEditableOutputCell && (activeEditableOutputCell.row !== rowIndex || activeEditableOutputCell.column !== columnIndex)) {
    saveActiveEditableOutputCellValue();
  }

  // Set the newly clicked cell as the active editable output cell
  activeEditableOutputCell = {
    element: clickedElement,
    row: rowIndex,
    sourceRow: sourceRowIndex,
    column: columnIndex,
    columnName: columnName
  };
  activeEditableOutputCellValue = helperNormalizeEditableCellValue(clickedElement.innerText || clickedElement.textContent);

  console.log("Editable output cell clicked:", {
    row: rowIndex,
    sourceRow: sourceRowIndex,
    column: columnIndex,
    columnName: columnName,
    value: activeEditableOutputCellValue
  });
}

function saveActiveEditableOutputCellValue() {
  if (selectedDisplayOption !== "List: Events & Thoughts" || !activeEditableOutputCell) {
    return;
  }

  const displayRowIndex = activeEditableOutputCell.row;
  const sourceRowIndex = activeEditableOutputCell.sourceRow ?? displayRowIndex;
  const columnIndex = activeEditableOutputCell.column;

  if (datasetArray[sourceRowIndex] && datasetArray[sourceRowIndex][columnIndex] !== undefined) {
    datasetArray[sourceRowIndex][columnIndex] = activeEditableOutputCellValue;
  }

  if (datasetArrayForDisplay && datasetArrayForDisplay[displayRowIndex] && datasetArrayForDisplay[displayRowIndex][columnIndex] !== undefined) {
    datasetArrayForDisplay[displayRowIndex][columnIndex] = activeEditableOutputCellValue;
  }

  activeEditableOutputCell = null;
  activeEditableOutputCellValue = "";
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
  eventAppLoaded();
});
