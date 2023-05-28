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
  for (var year of yearList) {
    var optionElement = document.createElement("option");
    optionElement.value = year;
    optionElement.text = year;
    selectYearElement.appendChild(optionElement);
  }
  
  // Populate the location dropdown
  var locationList = countryList.concat(cityList); // Merge both asrray
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
  for (var event of eventList) {
    var optionElement = document.createElement("option");
    optionElement.value = event;
    optionElement.text = event;
    selectEventElement.appendChild(optionElement);
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
    cell.style.fontWeight = "bold";
    cell.style.verticalAlign = "top";
    // If this is not the last column then set width to fixed, else, display table length
    if ( i != columnNames.length - 1) {
      cell.innerHTML = columnNames[i];
      cell.style.width = "150px";
    } else {
      cell.innerHTML = columnNames[i] + " (" + dataSetToDisplay.length + " rows)";
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
  
function displayGroupTable(groupbyDataToDisplay, columnNames, selectedYear, selectedLocation, selectedEvent, groupBy) {
  // Display the data in the table before adding the hyperlinks to some of the columns
  displayDataInTable(columnNames, groupbyDataToDisplay);

  // Add the hyperlinks to the body
  const tableRows = document.getElementById("tbody").childNodes;
  for (let i = 0; i < tableRows.length; i++) {
    const tableColumns = tableRows[i].childNodes;
    
    // Set the parameters that get passed when the count is clicked on
    var yearToPass = selectedYear;
    if (groupBy == "location") {
      var locationToPass = groupbyDataToDisplay[i][0];
      var eventToPass = selectedEvent;
    } else if (groupBy == "event") {
      var locationToPass = selectedLocation;
      var eventToPass = groupbyDataToDisplay[i][0] ;
    }
    var parameters = "\"" + yearToPass + "\", \"" + locationToPass + "\", \"" + eventToPass + "\", \"" + groupBy + "\"";
    let onclick_value = "location.href='javascript:eventHTMLListClicked(" + parameters + ")';"
    tableColumns[1].setAttribute("onclick", onclick_value);
    tableColumns[1].setAttribute("style", "text-decoration:underline;");
    
    // Set the parameters that get passed when months is clicked on
    if (groupBy == "event") {
      let parameters1 = "\"" + selectedYear + "\", \"" + selectedLocation + "\", \"" + groupbyDataToDisplay[i][0] + "\"";
      let onclick_value1 = "location.href='javascript:eventHTMLMonthsClicked(" + parameters1 + ")';"
      tableColumns[2].setAttribute("onclick", onclick_value1);
      tableColumns[2].setAttribute("style", "text-decoration:underline;");
    }
  }
}
  
function displayMonthsTable(countSelectionOccurance_ByMonth, clickedEvent) {
  // Display data in table
  var columnNames = ["Date", "Count"];
  displayDataInTable(columnNames, countSelectionOccurance_ByMonth);

  // Add the hyperlinks to the second cell of the body
  const tableRows = document.getElementById("tbody").childNodes;
  for (let i = 0; i < tableRows.length; i++) {
    // Create the parameters string to pass to the href 
    let dateParam = countSelectionOccurance_ByMonth[i][0];
    let locationParam = "";
    let eventParam = clickedEvent;
    let groupBy = "none";
    var parameters = "\"" + dateParam + "\", \"" + locationParam + "\", \"" + eventParam + "\", \"" + groupBy + "\"";
    let onclick_value = "location.href='javascript:eventHTMLListClicked(" + parameters + ")';"

    // Apply them to the second cell of that row
    const tableColumns = tableRows[i].childNodes;
    tableColumns[1].setAttribute("onclick", onclick_value);
    tableColumns[1].setAttribute("style", "text-decoration:underline;");
  }
}

function displaySummaryByMonthTable(columnNames, month_year_arr, countByMonth, sumByMonth) {
  // Clear table header element then add new row to it
  const thead_HTML_Element = document.getElementById("thead");
  thead_HTML_Element.replaceChildren();
  let row = thead_HTML_Element.insertRow();

  // Iterate over the column names array, creating a header for each, with proper styling
  for (var i = 0; i < columnNames.length; i++) {
    let cell = row.insertCell(i);
    cell.style.fontWeight = "bold";
    cell.style.verticalAlign = "top";
    cell.innerHTML = columnNames[i].replace('#',""); // Remove the hash from the column name 
    cell.style.width = "80px";
  }

  // Clear table body element
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  
  // Then iterate over each array line to first add a new row, then new cells within that row 
  for (var month_year of month_year_arr) {
    let row = new_tbody_HTML_Element.insertRow();
    var cell_number = 0;
    let cell = row.insertCell(cell_number);
    cell.innerHTML = month_year;
    for (var tag_key in countByMonth) {
      let cell = row.insertCell(++cell_number);
      cell.innerHTML = countByMonth[tag_key][month_year];
    }
    for (var tag_key in sumByMonth) {
      let cell = row.insertCell(++cell_number);
      cell.innerHTML = sumByMonth[tag_key][month_year];
    }
  }

}