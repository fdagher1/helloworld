function displayFileValidityError(error_message) {
  const new_tbody_HTML_Element = document.getElementById("errorcontent"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  let row = new_tbody_HTML_Element.insertRow(); // Create new row
  let cell = row.insertCell(0); // Create new cell
  cell.innerHTML = error_message; // Enter error message in the cell
}

function clearFileValidityError() {
  const new_tbody_HTML_Element = document.getElementById("errorcontent"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
}

function displayDataInTopPane() {
  let startTime = performance.now();
  var elementIdsToFill = ["timeItems", "locationItems", "eventItems"];
  var dataToFillElementsWith = [allDropdownValues[0], allDropdownValues[1], allDropdownValues[2]];
  
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
      inputElement.addEventListener("change", e => {eventCheckboxSelected(e);});
      var liElement = document.createElement("li");
      liElement.appendChild(inputElement);
      liElement.appendChild(labelElement);

      htmlElement.appendChild(liElement);
    }
``}
  
  // Fill the Display Options dropdown with its options
  var selectDisplayOptionElement = document.getElementById("select-displayoption");
  selectDisplayOptionElement.replaceChildren(); // Clear what's already there
  for (var displayoption of allDisplayOptions) {
    var optionElement = document.createElement("option");
    optionElement.value = displayoption;
    optionElement.text = displayoption;
    selectDisplayOptionElement.appendChild(optionElement);
  }
  console.log(`displayDataInTopPane executed in: ${performance.now() - startTime} milliseconds`);
}

function displayDataInTable(columnHeaders, dataSetToDisplay) {
  let startTime = performance.now();
  // Clear table header element then add new row to it
  const thead_HTML_Element = document.getElementById("thead");
  thead_HTML_Element.replaceChildren();
  let row = thead_HTML_Element.insertRow();

  // Iterate over the column names array, creating a header for each, with proper styling
  for (var i = 0; i < columnHeaders.length; i++) {
    let cell = row.insertCell(i);

    // Set column name value
    cell.innerHTML = columnHeaders[i];

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
      let cell = row.insertCell(j);
      cell.innerHTML = dataSetToDisplay[i][j];
    }
  }
  console.log(`displayDataInTable executed in: ${performance.now() - startTime} milliseconds`);
}

function updateUserInputForm(locationToDisplay, eventLinesToDisplay) {
  document.getElementById("input-location").value = locationToDisplay;
  document.getElementById("input-events").value = eventLinesToDisplay;
}