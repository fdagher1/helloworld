function displayFileValidityError(error_message) {
  const new_tbody_HTML_Element = document.getElementById("errorcontent"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
  let row = new_tbody_HTML_Element.insertRow(); // Create new row
  let cell = row.insertCell(0); // Create new cell
  cell.innerHTML = error_message; // Enter error message in the cell
}

function clearErrorMessages() {
  const new_tbody_HTML_Element = document.getElementById("errorcontent"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content
}

function displayDataInTopPane() {
  let startTime = performance.now();

  // Fill the 3 criteria checkboxes with their options
  // Year
  var selectYear = document.getElementById("select-year");
  selectYear.replaceChildren(); // Clear what's already there
  for (var year of ["All Years"].concat(allDropdownValues[0])) {
    var optionElement = document.createElement("option");
    optionElement.value = year;
    optionElement.text = year;
    selectYear.appendChild(optionElement);
  }

  // Location
  var selectLocation = document.getElementById("select-location");
  selectLocation.replaceChildren(); // Clear what's already there
  for (var year of ["All Locations"].concat(allDropdownValues[1])) {
    var optionElement = document.createElement("option");
    optionElement.value = year;
    optionElement.text = year;
    selectLocation.appendChild(optionElement);
  }

  // Event
  var selectEvent = document.getElementById("select-event");
  selectEvent.replaceChildren(); // Clear what's already there
  for (var year of ["All Events"].concat(allDropdownValues[2])) {
    var optionElement = document.createElement("option");
    optionElement.value = year;
    optionElement.text = year;
    selectEvent.appendChild(optionElement);
  }
  
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

function displayListOutput(dataSetToDisplay) {
  let startTime = performance.now();

  // Clear the previous events or table
  const datasetContainer = document.getElementById("dataset-container");
  datasetContainer.replaceChildren();
  const thead_HTML_Element = document.getElementById("thead");
  thead_HTML_Element.replaceChildren();
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content

  // Create the section elements to display the events in body
  const fragment = document.createDocumentFragment();
  const isEditableDisplayMode = selectedDisplayOption === "List: Events & Thoughts";
  for (let i = 0; i < dataSetToDisplay.length; i++) {
    const displayRowIndex = i;
    const sourceRowIndex = datasetDisplayRowSourceIndexMap[i] ?? i;

    // Create the parent/section HTML element
    const section = document.createElement("section");
    
    // Create the date child elements
    const dateText = document.createElement('span');
    dateText.textContent = (dataSetToDisplay[i][0] + " (day " + (dataSetToDisplay.length-i).toString()  +")");
    const dateDiv = document.createElement("div");
    dateDiv.replaceChildren(dateText, document.createElement('br'));
    dateDiv.classList.add("date-class");

    // Create the location child element
    const locationDiv = document.createElement("div");
    locationDiv.innerHTML = helperHighlightKeyword(dataSetToDisplay[i][1], searchWord);
    locationDiv.classList.add("location-class");
    locationDiv.contentEditable = isEditableDisplayMode ? "true" : "false";
    if (isEditableDisplayMode) {
      locationDiv.addEventListener("click", function (e) {eventOutputCellClicked(e, displayRowIndex, 1, "Location", sourceRowIndex);});
      locationDiv.addEventListener("input", function () {activeEditableOutputCellValue = helperNormalizeEditableCellValue(locationDiv.innerText || locationDiv.textContent);});
      locationDiv.addEventListener("blur", function () {if (activeEditableOutputCell && activeEditableOutputCell.element === locationDiv) {saveActiveEditableOutputCellValue();}});
    }

    // Create the event and thought child elements
    const eventDiv = document.createElement("div");
    const thoughtDiv = document.createElement("div");
    eventDiv.contentEditable = isEditableDisplayMode ? "true" : "false";
    thoughtDiv.contentEditable = isEditableDisplayMode ? "true" : "false";
    eventDiv.classList.add("event-class");
    thoughtDiv.classList.add("thought-class");
    eventDiv.setAttribute("data-placeholder", "");
    thoughtDiv.setAttribute("data-placeholder", "");
    if (isEditableDisplayMode) {
      eventDiv.addEventListener("click", function (e) {eventOutputCellClicked(e, displayRowIndex, 2, "Event", sourceRowIndex);});
      eventDiv.addEventListener("input", function () {activeEditableOutputCellValue = helperNormalizeEditableCellValue(eventDiv.innerText || eventDiv.textContent);});
      eventDiv.addEventListener("blur", function () {if (activeEditableOutputCell && activeEditableOutputCell.element === eventDiv) {saveActiveEditableOutputCellValue();}});
      thoughtDiv.addEventListener("click", function (e) {eventOutputCellClicked(e, displayRowIndex, 3, "Thought", sourceRowIndex);});
      thoughtDiv.addEventListener("input", function () {activeEditableOutputCellValue = helperNormalizeEditableCellValue(thoughtDiv.innerText || thoughtDiv.textContent);});
      thoughtDiv.addEventListener("blur", function () {if (activeEditableOutputCell && activeEditableOutputCell.element === thoughtDiv) {saveActiveEditableOutputCellValue();}});
    }
    if (selectedDisplayOption === "List: Events & Thoughts") {
      const eventText = helperNormalizeEditableCellValue(dataSetToDisplay[i][2]);
      const thoughtText = helperNormalizeEditableCellValue(dataSetToDisplay[i][3]);
      eventDiv.innerHTML = helperHighlightKeyword(eventText, searchWord);
      if (thoughtText != "") { // If thoughts for is not blank, then add it along with a line break before it to the display
        thoughtDiv.innerHTML = helperHighlightKeyword(thoughtText, searchWord);
      }
    } else if (selectedDisplayOption.includes("List: Events (Tagged)")) {
      const eventText = helperNormalizeEditableCellValue(dataSetToDisplay[i][2]);
      eventDiv.innerHTML = helperHighlightKeyword(eventText, searchWord);
    } else if (selectedDisplayOption.includes("List: Thoughts (All)")) {
      const thoughtText = helperNormalizeEditableCellValue(dataSetToDisplay[i][3]);
      thoughtDiv.innerHTML = helperHighlightKeyword(thoughtText, searchWord);
    }
    
    // Create a separator line between each section
    const seperatorDiv = document.createElement("div");
    seperatorDiv.innerHTML = `</br><hr style="border: 1px solid #ccc; margin-top: 10px; margin-bottom: 10px;">`;
    
    // Append the HTML
    section.appendChild(seperatorDiv);
    section.appendChild(dateDiv);
    section.appendChild(locationDiv);
    section.appendChild(eventDiv);
    section.appendChild(thoughtDiv);
    fragment.appendChild(section);
    //datasetContainer.appendChild(section);
  }

  datasetContainer.appendChild(fragment);

  datasetArrayForDisplay.length = 0; // to reduce the size of variables in the app
  
  console.log(`displayEventsInBody executed in: ${performance.now() - startTime} milliseconds`);
}

function displayTableOutput(columnHeaders, dataSetToDisplay) {
  let startTime = performance.now();
  
  // Clear the previous events or table
  const datasetContainer = document.getElementById("dataset-container");
  datasetContainer.replaceChildren();
  const thead_HTML_Element = document.getElementById("thead");
  thead_HTML_Element.replaceChildren();
  const new_tbody_HTML_Element = document.getElementById("tbody"); // Get tbody HTML element
  new_tbody_HTML_Element.replaceChildren() // Clear content

  // Add a new header row and iterate over the column headers array to add them to that row
  let row = thead_HTML_Element.insertRow();
  for (var i = 0; i < columnHeaders.length; i++) {
    let cell = row.insertCell(i);

    // Set column name value and styling
    cell.innerHTML = columnHeaders[i];
    cell.style.fontWeight = "bold";
    cell.style.verticalAlign = "top";
    if (cell.innerHTML == "Date" || cell.innerHTML == "Location") { // If column name is "Date" or "Location" set width to 150px
      cell.style.width = "150px";
    }
  }
  
  // Then iterate over each array line to first add a new row, then new cells within that row 
  for (var i = 0; i < dataSetToDisplay.length; i++) {
    let row = new_tbody_HTML_Element.insertRow();
    for (var j = 0; j < dataSetToDisplay[i].length; j++) {
      let cell = row.insertCell(j);
      let textToInsert = '';
      if (j == 0) { // If data is date, then make it clickable 
        textToInsert = `<bold>` + dataSetToDisplay[i][j] + `</bold>`;
      } else {
        textToInsert = dataSetToDisplay[i][j];
      }
      cell.innerHTML = textToInsert;
    }
  }
  console.log(`displayTableOutput executed in: ${performance.now() - startTime} milliseconds`);
}
