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

      // Display Data in Top Pane
      retrieveDataForTopPane();
      displayDataInTopPane();

      // Display Data in Table
      var columnNames = ["Date", "Location", "Event"];
      displayDataInTable(columnNames, importedDataSet);
      lastDisplayedDataSet = importedDataSet.slice(0); // This is needed otherwise searching from the textbox wouldn't work
  };
  reader.readAsArrayBuffer(event.target.files[0]);
  
  // Make the HTML controls available
  document.getElementById("button-displaytable").removeAttribute("disabled");
 
  // Dropdowns
  document.getElementById("select-date").removeAttribute("disabled");
  document.getElementById("select-location").removeAttribute("disabled");
  document.getElementById("select-event").removeAttribute("disabled");

  // Radio button
  document.getElementById("radiobutton-groupby-location").removeAttribute("disabled");
  document.getElementById("radiobutton-groupby-event").removeAttribute("disabled");
  document.getElementById("radiobutton-groupbyNoGrp-ShowEvents").removeAttribute("disabled");
  document.getElementById("radiobutton-groupbynone-showall").removeAttribute("disabled");

  // Search box
  document.getElementById("textbox-keyword").removeAttribute("disabled");

  // Check the show all radio button by default
  document.getElementById("radiobutton-groupbynone-showall").checked = true;

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
  if (document.getElementsByName("filterby")[0].checked) {
    groupBy = "location";
  } else if (document.getElementsByName("filterby")[1].checked) {
    groupBy = "event";
  } else if (document.getElementsByName("filterby")[2].checked) {
    groupBy = "NoGrp-ShowEvents";
  } else if (document.getElementsByName("filterby")[3].checked) {
    groupBy = "NoGrp-ShowLines";
  }

  // Remove the first part of the event name
  selectedEvent = selectedEvent.split("-")[1];

  // Clear out the text box content
  document.getElementById("textbox-keyword").value = "";
  
  // If no grouping then call the list function otherwise (i.e. if group by location or event) then call the group function
  if (groupBy.includes("NoGrp")) {
    let searchWord = "";
    document.getElementById("textbox-keyword").removeAttribute("disabled");
    retrieveDataforListTable(importedDataSet, selectedYear, selectedLocation, selectedEvent, groupBy, searchWord)
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
  document.getElementById("radiobutton-groupbyNoGrp-ShowEvents").checked = true;
  groupBy = "NoGrp-ShowEvents";
  retrieveDataforListTable(importedDataSet, selectedYear, chosenLocation, chosenEvent, groupBy, searchWord);
}

function eventKeywordEntered() {
  let searchWord = document.getElementById("textbox-keyword").value;

  // Gather inputs from panel
  var selectedYear = document.getElementById("select-date").value;
  var selectedLocation = document.getElementById("select-location").value;
  var selectedEvent = document.getElementById("select-event").value;
  var groupBy;
  if (document.getElementsByName("filterby")[0].checked) {
    groupBy = "location";
  } else if (document.getElementsByName("filterby")[1].checked) {
    groupBy = "event";
  } else if (document.getElementsByName("filterby")[2].checked) {
    groupBy = "NoGrp-ShowEvents";
  } else if (document.getElementsByName("filterby")[3].checked) {
    groupBy = "NoGrp-ShowLines";
  }

  // Remove the first part of the event name
  selectedEvent = selectedEvent.split("-")[1];

  retrieveDataforListTable(lastDisplayedDataSet, selectedYear, selectedLocation, selectedEvent, groupBy, searchWord);
}
