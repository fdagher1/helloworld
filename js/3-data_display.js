function displayFileValidityError(error_message){
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  let row = new_tbody_HTML_Element.insertRow(); // Create new row
  let cell = row.insertCell(0); // Create new cell
  cell.innerHTML = error_message; // Enter error message in the cell
}

function displayDataInTopPane() {
  // Populate the time dropdown
  var selectYearElement = document.getElementById("select-date");
  selectYearElement.replaceChildren(); // Clear what's already there
  for (var year of yearsListedInYearsDropdown) {
    var optionElement = document.createElement("option");
    optionElement.value = year;
    optionElement.text = year;
    selectYearElement.appendChild(optionElement);
  }
  
  // Populate the location dropdown
  var locationList = countriesListedInLocationDropdown.concat(citiesListedInLocationDropdown); // Merge both asrray
  var selectLocationElement = document.getElementById("select-location");
  selectLocationElement.replaceChildren(); // Clear what's already there
  for (var location of locationList) {
    var optionElement = document.createElement("option");
    optionElement.value = location;
    if (location.includes("All ")) {
      optionElement.text = location;
    } else {
      optionElement.text = "- " + location;
    }
    
    selectLocationElement.appendChild(optionElement);
  }

  // Populate the events dropdown
  var selectEventElement = document.getElementById("select-event");
  selectEventElement.replaceChildren(); // Clear what's already there
  for (var event of eventsListedInEventsDropdown) {
    var optionElement = document.createElement("option");
    optionElement.value = event;
    optionElement.text = event;
    selectEventElement.appendChild(optionElement);
  }

  // Populate the events dropdown
  var selectDisplayOptionElement = document.getElementById("select-displayoption");
  selectDisplayOptionElement.replaceChildren(); // Clear what's already there
  for (var displayoption of displayOptionsListedInDisplayOptionsDropdown) {
    var optionElement = document.createElement("option");
    optionElement.value = displayoption;
    optionElement.text = displayoption;
    selectDisplayOptionElement.appendChild(optionElement);
  }
}

function displayDataInTable(columnNames, dataSetToDisplay) {
  // Clear table header element then add new row to it
  const thead_HTML_Element = document.getElementById("thead");
  thead_HTML_Element.replaceChildren();
  let row = thead_HTML_Element.insertRow();

  // Iterate over the column names array, creating a header for each, with proper styling
  for (var i = 0; i < columnNames.length; i++) {
    let cell = row.insertCell(i);

    // Set column name value
    cell.innerHTML = columnNames[i];

    // Set column styling
    cell.style.fontWeight = "bold";
    cell.style.verticalAlign = "top";

    // If column name is "Date" or "Location" set width to 150px
    if (cell.innerHTML == "Date" || cell.innerHTML == "Location") {
      cell.style.width = "150px";
    }
  }

  // Clear table body element
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  
  // Then iterate over each array line to first add a new row, then new cells within that row 
  for (var i = 0; i < dataSetToDisplay.length; i++) {
    let row = new_tbody_HTML_Element.insertRow();
    for (var j = 0; j < dataSetToDisplay[i].length; j++) {
      // Replace the entries \r\n with actual line breaks, checking first if the line is of type string 
      // (ex: not number for), as it could be of type number when using groupby, in which case code would fail
      if (typeof dataSetToDisplay[i][j] === 'string') {
        dataSetToDisplay[i][j] = dataSetToDisplay[i][j].replace(/\r\n/g, "<br>");
      }
      let cell = row.insertCell(j);
      cell.innerHTML = dataSetToDisplay[i][j];
    }
  }
}
