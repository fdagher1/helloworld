// Define global variables
var importedDataSet; // Data from excel file, program never changes it
var lastDisplayedDataSet;
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

    // Validate XLSX format and data
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
  
  // Make the HTML controls available
  // Buttons
  document.getElementById("button-displaytable").removeAttribute("disabled");
  document.getElementById("button-summary-bymonth").removeAttribute("disabled");
 
  // Dropdowns
  document.getElementById("select-date").removeAttribute("disabled");
  document.getElementById("select-location").removeAttribute("disabled");
  document.getElementById("select-event").removeAttribute("disabled");

  // Radio button
  document.getElementById("radiobutton-groupby-location").removeAttribute("disabled");
  document.getElementById("radiobutton-groupby-event").removeAttribute("disabled");
  document.getElementById("radiobutton-groupbynone-showeventonly").removeAttribute("disabled");
  document.getElementById("radiobutton-groupbynone-showalllines").removeAttribute("disabled");

  // Search box
  document.getElementById("textbox-keyword").removeAttribute("disabled");

  // Check the show all radio button by default
  document.getElementById("radiobutton-groupbynone-showalllines").checked = true;

  // Clear content of arrays
  dataSet = [];
  yearList = [];
  countryList = [];
  cityList = [];
  eventList = [];
}

function eventDarkModeButtonClicked() {
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

function eventDisplayButtonClicked() {
  // Gather inputs from panel
  var selectedYear = document.getElementById("select-date").value;
  var selectedLocation = document.getElementById("select-location").value;
  var selectedEvent = document.getElementById("select-event").value;
  var groupBy;
  if (document.getElementById("radiobutton-groupby-location").checked) {
    groupBy = "location";
  } else if (document.getElementById("radiobutton-groupby-event").checked) {
    groupBy = "event";
  } else if (document.getElementById("radiobutton-groupbynone-showeventonly").checked) {
    groupBy = "nogrp-showeventonly";
  } else if (document.getElementById("radiobutton-groupbynone-showalllines").checked) {
    groupBy = "nogrp-showalllines";
  }

  // Remove the first part of the event name
  selectedEvent = selectedEvent.split("-")[1];

  // Clear out the text box content
  document.getElementById("textbox-keyword").value = "";
  
  // If no grouping then call the list function otherwise (i.e. if group by location or event) then call the group function
  if (groupBy.includes("nogrp")) {
    let searchWord = "";
    document.getElementById("textbox-keyword").removeAttribute("disabled");
    retrieveDataforListTable(importedDataSet, selectedYear, selectedLocation, selectedEvent, groupBy, searchWord);
  } else {
    // Disable the keyword textbox since it is not useful when in this state
    document.getElementById("textbox-keyword").setAttribute("disabled", "");
    retrieveDataforGroupTable(selectedYear, selectedLocation, selectedEvent, groupBy);
  }
}

function eventHTMLMonthsClicked(selectedYear, selectedLocation, clickedEvent) {
  document.getElementById("textbox-keyword").setAttribute("disabled", "");
  retrieveDataforMonthsTable(selectedYear, selectedLocation, clickedEvent);
}

function eventHTMLListClicked(selectedYear, chosenLocation, chosenEvent, groupBy ) {
  document.getElementById("textbox-keyword").removeAttribute("disabled");
  let searchWord = "";
  document.getElementById("radiobutton-groupbynone-showeventonly").checked = true;
  groupBy = "nogrp-showeventonly";
  retrieveDataforListTable(importedDataSet, selectedYear, chosenLocation, chosenEvent, groupBy, searchWord);
}

function eventKeywordEntered() {
  let searchWord = document.getElementById("textbox-keyword").value;

  // Gather inputs from panel
  var selectedYear = document.getElementById("select-date").value;
  var selectedLocation = document.getElementById("select-location").value;
  var selectedEvent = document.getElementById("select-event").value;
  var groupBy;
  if (document.getElementById("radiobutton-groupby-location").checked) {
    groupBy = "location";
  } else if (document.getElementById("radiobutton-groupby-event").checked) {
    groupBy = "event";
  } else if (document.getElementById("radiobutton-groupbynone-showalllines").checked) {
    groupBy = "nogrp-showalllines";
  } else if (document.getElementById("radiobutton-groupbynone-showeventonly").checked) {
    groupBy = "nogrp-showeventonly";
  }

  // Remove the first part of the event name
  selectedEvent = selectedEvent.split("-")[1];

  retrieveDataforListTable(lastDisplayedDataSet, selectedYear, selectedLocation, selectedEvent, groupBy, searchWord);
}

function eventSummaryByMonthButtonClicked() {
    // Gather inputs from panel
    var selectedYear = document.getElementById("select-date").value;
    var selectedLocation = document.getElementById("select-location").value;
  
  retrieveDataForSummaryByMonthTable(selectedYear, selectedLocation);
}