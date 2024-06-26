function displayFileValidityError(error_message){
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  let row = new_tbody_HTML_Element.insertRow(); // Create new row
  let cell = row.insertCell(0); // Create new cell
  cell.innerHTML = error_message; // Enter error message in the cell
}

function displayDataInTopPane() {
  let startTime = performance.now();
  var elementIdsToFill = ["timeItems", "locationItems", "eventItems"];
  var dataToFillElementsWith = [yearsListedInYearsDropdown, countriesListedInLocationDropdown, eventsListedInEventsDropdown];
  
  // Loop over the 3 criteria dropdowns to fill them with their corresponding data
  for (let i=0; i < elementIdsToFill.length; i++) {
    var htmlElement = document.getElementById(elementIdsToFill[i]);
    htmlElement.replaceChildren(); // Clear what's already there
    for (var dataValue of dataToFillElementsWith[i]) {
      var labelElement = document.createElement("label");
      labelElement.innerText = dataValue;

      var inputElement = document.createElement("input");
      inputElement.type = "checkbox";
      inputElement.value = dataValue;

      var liElement = document.createElement("li");
      liElement.appendChild(inputElement);
      liElement.appendChild(labelElement);

      htmlElement.appendChild(liElement);
    }
``}
  
  // Fill the Display Options dropdown with its options
  var selectDisplayOptionElement = document.getElementById("select-displayoption");
  selectDisplayOptionElement.replaceChildren(); // Clear what's already there
  for (var displayoption of displayOptionsListedInDisplayOptionsDropdown) {
    var optionElement = document.createElement("option");
    optionElement.value = displayoption;
    optionElement.text = displayoption;
    selectDisplayOptionElement.appendChild(optionElement);
  }
  console.log(`displayDataInTopPane executed in: ${performance.now() - startTime} milliseconds`);
}

function displayDataInTable(columnNames, dataSetToDisplay) {
  let startTime = performance.now();
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
  console.log(`displayDataInTable executed in: ${performance.now() - startTime} milliseconds`);
}
