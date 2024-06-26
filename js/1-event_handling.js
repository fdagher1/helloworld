// Define global variables
var datasetFromExcel = []; // Data from excel file, program never changes it
var datasetBeforeKeywordFilter = []; // Holds the data to display in the output before the keyword filter is applied
var datasetAfterKeywordFilter = []; // Holds the data to display in the output after the keyword filter is applied
var yearsListedInYearsDropdown = []; // All values in the Years dropdown
var countriesListedInLocationDropdown = []; // All country names in the Location dropdown
var citiesListedInLocationDropdown = []; // All city names in the Location dropdown
var eventsListedInEventsDropdown = []; // All events in the Events dropdown
var displayOptionsListedInDisplayOptionsDropdown = []; // All Display Options in the Display Options dropdown

// User input
var selectedTime = []; // Value of the user selected year
var selectedLocations = []; // Value of the user selected location
var selectedEvents = []; // Value of the user selected event
var searchWord = ""; // Value of the user entered keyword
var selectedDisplayOption; // Value of the user selected radio button
var userAction = ""; // Value to hold what user did to trigger the output: "Textbox Change" or "Button Press"

function eventUploadButtonClicked(event) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    datasetFromExcel = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }); // header: 1 instructs xlsx to create an 'array of arrays'
    datasetFromExcel.shift(); // Remove the table header

    // Validate the data imported from the XLSX file
    var file_validity_message = validateFileFormatAndData();

    // If file is valid then proceed with displaying the top pane otherwise advise user to look in the browser's console for errors
    if (file_validity_message == "file is valid") {
      // Display Data in Top Pane
      retrieveDataForTopPane();

      // Display Data in Table
      retrieveExcelFileTable();
    }
  };
  reader.readAsArrayBuffer(event.target.files[0]);
  
  // Make available the HTML controls 
  // Buttons
  document.getElementById("button-displaytable").removeAttribute("disabled");
  document.getElementById("select-displayoption").removeAttribute("disabled");
  document.getElementById("textbox-keyword").removeAttribute("disabled");
}

function criteriaDropdownClicked(event) {
  if (datasetFromExcel.length > 0){ // That means the excel file has been uploaded
    if (event.target.parentNode.classList.contains('visible'))
      event.target.parentNode.classList.remove('visible');
    else
    event.target.parentNode.classList.add('visible');
  }
}

function eventDisplayButtonClicked() {
  // Set user action as it is used by the retrieveDataForLinesTable() function to determine what to do
  userAction = "Button Press";

  // Gather user inputs
  retrieveDataFromTopPane();

  // Check which display option user chose 
  if (selectedDisplayOption == "List Excel File") {
    retrieveExcelFileTable();
  } else if (selectedDisplayOption == "List All Lines") {
    retrieveDataForLinesTable();
  } else if (selectedDisplayOption == "List Event Lines") {
    retrieveDataForLinesTable();
  } else if (selectedDisplayOption == "Group By Location") {
    retrieveDataforGroupByLocationTable();
  } else if (selectedDisplayOption.includes("Summarize")) {
    retrieveDataforSummaryTable();
  }
}

function eventKeywordEntered() {
  // Set user action as it is used by the retrieveDataForLinesTable() function to determine what to do
  userAction = "Textbox Change";

  // Gather keyword
  retrieveDataFromTopPane();

  // Retrieve data which then calls output display
  if (selectedDisplayOption == "List Excel File" || selectedDisplayOption == "List All Lines" || selectedDisplayOption == "List Event Lines") {
    retrieveDataForLinesTable();
  }

}

function eventDarkModeButtonClicked() {
  // If dark mode was not set, then set it
  if (darkModeBtnValue = document.getElementById("button-darktoggle").value == "Dark Mode: Off") {
    document.getElementById("button-darktoggle").value = "Dark Mode: On";
    document.getElementById("button-darktoggle").classList.add("darkclass");
    document.getElementById("button-upload").classList.add("darkclass");
    document.getElementById("timeDropdownDiv").classList.add("darkclass");
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
    document.getElementById("timeDropdownDiv").classList.remove("darkclass");
    document.getElementById("locationDropdownDiv").classList.remove("darkclass");
    document.getElementById("eventDropdownDiv").classList.remove("darkclass");
    document.getElementById("select-displayoption").classList.remove("darkclass");
    document.getElementById("button-displaytable").classList.remove("darkclass");
    document.getElementById("textbox-keyword").classList.remove("darkclass");
    document.getElementById("body").classList.remove("darkclass");
  }
}
