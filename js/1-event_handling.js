// Define global variables
var importedDataSet; // Data from excel file, program never changes it
var lastDisplayedDataSet; // Data displayed in the output table
var yearList = [];
var countryList = [];
var cityList = [];
var eventList = [];

function eventUploadButtonClicked(event) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    importedDataSet = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }); // header: 1 instructs xlsx to create an 'array of arrays'
    importedDataSet.shift(); // Remove the table header

    // Validate the data imported from the XLSX file
    var file_validity_message = validateFileFormatAndData();

    // If file is valid then proceed with displaying the top pane otherwise advise user to look in the browser's console for errors
    if (file_validity_message == "file is valid") {
      // Display Data in Top Pane
      retrieveDataForTopPane();
      displayDataInTopPane();

      // Display Data in Table
      var columnNames = ["Date", "Location", "Event"];
      displayDataInTable(columnNames, importedDataSet);
      lastDisplayedDataSet = importedDataSet.slice(0); // This is needed otherwise searching from the textbox wouldn't work
    } else {
      displayFileValidityError(file_validity_message);
    }
  };
  reader.readAsArrayBuffer(event.target.files[0]);
  
  // Make available the HTML controls 
  // Buttons
  document.getElementById("button-displaytable").removeAttribute("disabled");
  document.getElementById("button-summary-bymonth").removeAttribute("disabled");
 
  // Dropdowns
  document.getElementById("select-date").removeAttribute("disabled");
  document.getElementById("select-location").removeAttribute("disabled");
  document.getElementById("select-event").removeAttribute("disabled");

  // Radio button
  document.getElementById("radiobutton-groupbylocation").removeAttribute("disabled");
  document.getElementById("radiobutton-showeventonly").removeAttribute("disabled");
  document.getElementById("radiobutton-showalllines").removeAttribute("disabled");

  // Search box
  document.getElementById("textbox-keyword").removeAttribute("disabled");

  // Check the show all radio button by default
  document.getElementById("radiobutton-showalllines").checked = true;

  // Clear content of arrays
  dataSet = [];
  yearList = [];
  countryList = [];
  cityList = [];
  eventList = [];
}

function eventDisplayButtonClicked() {
  // Gather input values from the dropdowns and radio button 
  var selectedYear = document.getElementById("select-date").value;
  var selectedLocation = document.getElementById("select-location").value;
  var selectedEvent = document.getElementById("select-event").value.split("-")[1]; // Remove the prefix from the event name
  var selectedRadioButton;
  if (document.getElementById("radiobutton-groupbylocation").checked) {
    selectedRadioButton = "GroupByLocation";
  } else if (document.getElementById("radiobutton-showeventonly").checked) {
    selectedRadioButton = "ShowEventOnly";
  } else if (document.getElementById("radiobutton-showalllines").checked) {
    selectedRadioButton = "ShowAllLines";
  }

  // Clear out the text box content
  document.getElementById("textbox-keyword").value = "";
  
  // If user chose to group by location then call the group function
  if (selectedRadioButton == "GroupByLocation") {
    document.getElementById("textbox-keyword").setAttribute("disabled", ""); // Disable keyword seach since not needed here
    retrieveDataforGroupByLocationTable(selectedYear, selectedLocation, selectedEvent);
  // otherwise call the list function
  } else {
    document.getElementById("textbox-keyword").removeAttribute("disabled"); // Enable keyword seach in case it was disabled
    let searchWord = "";
    retrieveDataforListTable(importedDataSet, selectedYear, selectedLocation, selectedEvent, selectedRadioButton, searchWord);
  }
}

function eventKeywordEntered() {
  let searchWord = document.getElementById("textbox-keyword").value;

  // Gather input values from the dropdowns and radio button 
  var selectedYear = document.getElementById("select-date").value;
  var selectedLocation = document.getElementById("select-location").value;
  var selectedEvent = document.getElementById("select-event").value.split("-")[1]; // Remove the prefix from the event name
  var selectedRadioButton;
  if (document.getElementById("radiobutton-groupbylocation").checked) {
    selectedRadioButton = "GroupByLocation";
  } else if (document.getElementById("radiobutton-showeventonly").checked) {
    selectedRadioButton = "ShowEventOnly";
  } else if (document.getElementById("radiobutton-showalllines").checked) {
    selectedRadioButton = "ShowAllLines";
  }

  retrieveDataforListTable(lastDisplayedDataSet, selectedYear, selectedLocation, selectedEvent, selectedRadioButton, searchWord);
}

function eventDarkModeButtonClicked() {
  // If dark mode was not set, then set it
  if (darkModeBtnValue = document.getElementById("button-darktoggle").value == "Dark Mode: Off") {
    document.getElementById("button-darktoggle").value = "Dark Mode: On";
    document.getElementById("body").classList.add("darkclass");
    document.getElementById("button-upload").classList.add("darkclass");
    document.getElementById("button-displaytable").classList.add("darkclass");
    document.getElementById("select-date").classList.add("darkclass");
    document.getElementById("select-location").classList.add("darkclass");
    document.getElementById("select-event").classList.add("darkclass");
    document.getElementById("textbox-keyword").classList.add("darkclass");

    document.getElementById("button-darktoggle").classList.remove("lightclass");
  // otherwise, unset it
  } else {
    document.getElementById("button-darktoggle").value = "Dark Mode: Off";
    document.getElementById("body").classList.remove("darkclass");
    document.getElementById("button-upload").classList.remove("darkclass");
    document.getElementById("button-displaytable").classList.remove("darkclass");
    document.getElementById("select-date").classList.remove("darkclass");
    document.getElementById("select-location").classList.remove("darkclass");
    document.getElementById("select-event").classList.remove("darkclass");
    document.getElementById("textbox-keyword").classList.remove("darkclass");
  }
}

function eventSummaryByMonthButtonClicked() {
    // Gather inputs from panel
    var selectedYear = document.getElementById("select-date").value;
    var selectedLocation = document.getElementById("select-location").value;
  
  retrieveDataForSummaryByMonthTable(selectedYear, selectedLocation);
}