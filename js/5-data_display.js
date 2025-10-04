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
      inputElement.addEventListener("change", e => {eventFilterCheckboxSelected(e);});
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
  for (var i = 0; i < dataSetToDisplay.length; i++) {
    // Create the parent/section HTML element
    const section = document.createElement("section");
    
    // Create the child HTML elements
    const dateAndLocationDiv = document.createElement("div");
    const eventDiv = document.createElement("div");
    const seperatorDiv = document.createElement("div");
    
    // Add the text to the elements
    dateAndLocationDiv.innerHTML = `<a onclick="eventInputDateChanged(event, 'outputTable')" style="font-weight: bold; text-decoration: underline; font-size: large;">` + 
                                    dataSetToDisplay[i][0] + `</a>` + ': ' + '<em>' + dataSetToDisplay[i][1] + '</em></br></br>';
    eventDiv.textContent = dataSetToDisplay[i][2];
    seperatorDiv.innerHTML = `</br><hr style="border: 1px solid #ccc; margin-top: 10px; margin-bottom: 10px;">`;

    // Append the HTML
    section.appendChild(seperatorDiv);
    section.appendChild(dateAndLocationDiv);
    section.appendChild(eventDiv);
    fragment.appendChild(section);
  }

  datasetContainer.appendChild(fragment);
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

function displayUserInputForm(dateToDisplay, locationToDisplay, eventLinesToDisplay) {
  // display the values in the input form
  document.getElementById("input-date").valueAsDate = new Date(new Date(dateToDisplay));
  document.getElementById("input-location").value = locationToDisplay;
  document.getElementById("input-events").value = eventLinesToDisplay;
}
