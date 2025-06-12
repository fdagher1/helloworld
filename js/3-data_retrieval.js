function retrieveDataForTopPane() {
  let startTime = performance.now();
  // RETRIEVE THE YEARS LIST
  var currentYear = new Date().getFullYear();
  var startingYear = new Date(datasetArray[datasetArray.length-1][0]).getFullYear();
  for (var year = currentYear; year >= startingYear; year--) {
    allDropdownValues[0].push(year.toString());
  }

  // RETRIEVE THE LOCATIONS LIST
  // Iterate over every row in the table
  for (let i = 0; i < datasetArray.length; i++) {
    let rowLocationValueArray = datasetArray[i][1].split(","); // Get the city and country values in an array
    // Iterate over every city_country that day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array

      // Add country name to array if not already there
      let countryName = cityCountrySplitArray[1].trim();
      if (!countryName.includes(")") && !allDropdownValues[1].includes(countryName)) {
        allDropdownValues[1].push(countryName);
      }
      
    }
  }
  allDropdownValues[1].sort();

  // RETRIEVE THE EVENTS LIST
  allDropdownValues[2] = datasetArray[datasetArray.length-1][2].split(";"); // First populate it from the provided list
  allDropdownValues[2].pop(); // The last array entry is blank due to the split function, so remove it

  // Then remove the breakline characters at the end of each entry
  for (let i=0; i < allDropdownValues[2].length; i++) {
    if (allDropdownValues[2][i].includes("<br>")) {
      allDropdownValues[2][i] = allDropdownValues[2][i].split("<br>")[1];
    }
  }
  
  // Then remove the events with Ignore_ in their name since we dont need them 
  let cleanupArray = [];
  for (let i=0; i < allDropdownValues[2].length; i++) {
    if (!allDropdownValues[2][i].includes("Ignore_")) {
      cleanupArray.push(allDropdownValues[2][i]);
    }
  }
  allDropdownValues[2] = cleanupArray.slice(); // Set existing array equal to the new/cleaned one

  // RETRIEVE THE DISPLAY OPTIONS LIST
  var displayOptionsText = ["List: All Lines", "List: Event Lines", "GroupBy: Country", "GroupBy: State", "GroupBy: City"]; // This holds the options to display in the Display Options dropdown 
  var eventCategories = []; // This will hold the variable event categories to be used in the display
  for (eventName of allDropdownValues[2]) {
    var eventCategory = eventName.split("_")[0];
    if (!eventCategories.includes(eventCategory)) {
      eventCategories.push(eventCategory);
      displayOptionsText.push("Summary: " + eventCategory);
    }
  }
  allDisplayOptions = displayOptionsText.slice();

  console.log(`retrieveDataForTopPane executed in: ${performance.now() - startTime} milliseconds`);
  displayDataInTopPane();
}

function retrieveDataFromTopPane() {
  let startTime = performance.now();
  // RETRIEVE SELECTED DATE(S), LOCATION(S), EVENT(S)
  // Clear content of the dropdown arrays before filling them again
  selectedDropdownValues[0].length = 0;
  selectedDropdownValues[1].length = 0;
  selectedDropdownValues[2].length = 0;

  // Define new variables to use
  var elementIdsToGetDataFrom = ["timeItems", "locationItems", "eventItems"];
  
  // Loop over the 3 criteria dropdowns to get their corresponding: 1- values, and 2- select status (i.e., whether selected or not)
  for (let i=0; i < elementIdsToGetDataFrom.length; i++) {
    // Get an array of all the <li> children of the dropdown 
    var liElements = document.getElementById(elementIdsToGetDataFrom[i]).children;
    // Loop over each <li> entry to get its <input> child and then check if it's checked or unchecked
    for (const liElement of liElements) {
      var inputElement = liElement.children[0]; // the first child of the <li> element is the <input> element
      
      // Fill the selectedDropdownValues array with only selected values
      if (inputElement.checked) {
        if (inputElement.value.includes("_")) { // i.e., events
          selectedDropdownValues[i].push(inputElement.value.split("_")[1]); 
        } else { // i.e., times and locations 
          selectedDropdownValues[i].push(inputElement.value); 
        }
      }
    }
  }

  // If any of the selections are blank then fill the array with all of options (as if they were all selected)
  for (let i=0; i < selectedDropdownValues.length; i++) {
    if (selectedDropdownValues[i].length == 0) { // Meaning no values were selected
      if (i != 2) { // Meaning it's not events, then copy the data as is
        selectedDropdownValues[i] = allDropdownValues[i].slice();
      } else { // Meaning it's events, then only display the part after the _ sign
        for (j=0; j<allDropdownValues[i].length; j++) {
          selectedDropdownValues[i].push(allDropdownValues[i][j].split("_")[1]);
        }
      }
    }
  }

  // RETRIEVE SELECTED DISPLAY OPTIONS
  selectedDisplayOption = document.getElementById("select-displayoption").value;

  // RETRIEVE THE TEXTBOX CONTENT
  searchWord = document.getElementById("textbox-keyword").value;
  if (searchWord == null) {
    searchWord == "";
  }
  console.log(`retrieveDataFromTopPane executed in: ${performance.now() - startTime} milliseconds`);
}

function retrieveDataForListTable() {
  let startTime = performance.now();
  
  // Provide the column names for table to display data: 1- "Data", 2- "Location", and 3- Number of rows
  var columnHeaders = ["Date", "Location", "(" + datasetArrayForDisplay.length + " rows)"];

  console.log(`retrieveDataForListTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the data
  displayDataInTable(columnHeaders, datasetArrayForDisplay);

}

function retrieveDataForGroupByTable() {
  let startTime = performance.now();

  // RETRIEVE THE LOCATIONS LIST
  var countOfLocationDictionaryArray = [{}, {}, {}]; // Array of dictionaries that will have city, state, and country counts in it
  // Iterate over every row in the table
  for (let i = 0; i < datasetArrayForDisplay.length; i++) {
    let rowLocationValueArray = datasetArrayForDisplay[i][1].split(","); // Place each location from that day in an array
    // Iterate over every city_country entry of the array
    var locationsAddedForThisDay = [[], [], []]; // Used to capture the locations added for a given day, in order not to over count them that same day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array

      // Add city name to dictionary if not already there, otherwise increment count
      let cityName = cityCountrySplitArray[0].trim();
      if (!cityName.includes("(") && !locationsAddedForThisDay[0].includes(cityName)) { 
          helperIncrementCount(cityName, countOfLocationDictionaryArray[0]);
          locationsAddedForThisDay[0].push(cityName);
      }

      // Add country name to dictionary if not already there, otherwise increment count
      let countryName = cityCountrySplitArray[1].trim();
      if (!countryName.includes(")") && !locationsAddedForThisDay[2].includes(countryName)) {
        helperIncrementCount(countryName, countOfLocationDictionaryArray[2]);
        locationsAddedForThisDay[2].push(countryName);
      }

      // Add state name to dictionary if country is USA and state is not already there and country is US, otherwise increment count
      defaultCountrySuffix = helperSetBeaklineCharacter(datasetArray[datasetArray.length-2][2], "<br>tobackslashn").split("\n")[1]; // Get default country suffix
      if (countryName == defaultCountrySuffix.slice(1)) {
        let stateName = helperSplitStringLastOccurrence(cityName, " ");
        if(!locationsAddedForThisDay[1].includes(stateName)) {
          helperIncrementCount(stateName, countOfLocationDictionaryArray[1]);
          locationsAddedForThisDay[1].push(stateName);
        }
      }
    }
  }
  
  // Check which display option the user selected in order to determine what to sort and then to output it 
  if (selectedDisplayOption == "GroupBy: Country") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[2]);
  } else if (selectedDisplayOption == "GroupBy: State") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[1]);
  } else if (selectedDisplayOption == "GroupBy: City") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[0]);
  }
  
  // Set the columnHeaders for use when displaying the table
  var columnHeaders = ["Locations", "Count"]; // To hold the column names for passing to the data display function

  console.log(`retrieveDataforGroupByLocationTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the group table
  displayDataInTable(columnHeaders, groupbyDataToDisplay);
}

function retrieveDataforSummaryTable() {
  let startTime = performance.now();

  // ITERATE OVER THE DATASET TO FIND MATCHES WITH THE EVENTS FROM THE USER'S SUMMARY OPTION
  // Compile event list of interest based on the user's "Summary: " selection
  var eventsToQuery = [];
  for (eventName of allDropdownValues[2]) {
    if (eventName.includes(selectedDisplayOption.split(" ")[1])) { // i.e., take after the word "Summary: "
      eventsToQuery.push(eventName.split("_")[1]);
    }
  }

  // Compile the month/year array based on the dates in the dataset
  var month_year_arr = []; // holds the month/year array
  for (var row of datasetArrayForDisplay) { // Loop over the filtered datasheet to identify the different months needed to be covered
    var month_year = (new Date(row[0]).getMonth()+1).toString() +"/" + new Date(row[0]).getFullYear().toString(); //Adding 1 to month as it starts from 0
    if (!month_year_arr.includes(month_year)) {
      month_year_arr.push(month_year);
    }
  }
  
  // Build the dictionary that will hold the count of each event in each month (dictionary of a dictionaries), Ex: countByMonth["1/2023"]["#Workout"] = 0; 
  var countByMonth = {};
  for (let month_year of month_year_arr) {
    countByMonth[month_year] = {};
    for (let eventToQuery of eventsToQuery) {
      let temp_month_year_dict = {};
      temp_month_year_dict[eventToQuery] = 0;
      countByMonth[month_year] = Object.assign(countByMonth[month_year], temp_month_year_dict); // This is needed as countByMonth[eventToQuery] = {month_year: 0}; results in month_year used as value 
    }
  }
  
  // Iterate over the datasheet to count or sum the hits for each selected tag
  for (i = 0; i < datasetArrayForDisplay.length; i++) {
    
    // Get that row's date
    var cell_date = new Date(datasetArrayForDisplay[i][0]);
    var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
    
    // Iterate over each line in the row's event cell 
    var rowsFromEventsCell = datasetArrayForDisplay[i][2].split("<br>");
    for (rowFromEventsCell of rowsFromEventsCell) {
      // Check if line has hashtag sign first to save time from iterating for each selected event later
      if (rowFromEventsCell.includes("#")) {
        for (const eventToQuery of eventsToQuery) { // Iterate over every selected event to check for matches 
          if (rowFromEventsCell.includes("#" + eventToQuery.split("-")[0]))  { // I removed the suffix, such as -Sum, from the event name since the event name doesn't actually contain it
            if (eventToQuery.includes("-DSum")) { // If event ends with sum then sum the figures 
              countByMonth[month_year][eventToQuery] += helperReturnDSumFromString(rowFromEventsCell); // Get the figures from that cell and add them
            } else if (eventToQuery.includes("-Sum")) { // If event ends with sum then sum the figures 
              countByMonth[month_year][eventToQuery] += helperReturnSumFromString(rowFromEventsCell); // Get the figures from that cell and add them
            } else { // Then treat event as a normal tag
              countByMonth[month_year][eventToQuery] += 1 // Increment count in dictionary
            }  
          }
        }
      }
    }
  }
  
  // PREPARE DATA FOR OUTPUT
  
  // Convert the countByMonth dictionary of dictionaries to an array of arrays for use in the display data function
  var summaryDataset = [];
  for (let monthYearDictionaryKey in countByMonth) {
    var rowToAdd = [];
    // First push the date as the first value
    rowToAdd.push(monthYearDictionaryKey); 
    // Then push the counts
    for (let tagDictionaryKey in countByMonth[monthYearDictionaryKey]) {
      rowToAdd.push(countByMonth[monthYearDictionaryKey][tagDictionaryKey]);
    }
    summaryDataset.push(rowToAdd);
  }

  // Create the table header and include the total from each column in the header
  var columnHeaders = ["Month"];
  for (tag of eventsToQuery) { // Iterate over every column (i.e. tag) 
    // Iterate over every row (i.e. month) in this column in order to sum the total to later display it in the header
    let totalCount = 0;
    for (let monthYearDictionaryKey in countByMonth) {
      totalCount += countByMonth[monthYearDictionaryKey][tag];
    }

    // Add the new column name to the column names array
    columnHeaders.push(tag + "(" + totalCount.toString() + ")");
  }

  console.log(`retrieveDataforSummaryTable executed in: ${performance.now() - startTime} milliseconds`);
  
  // DISPLAY THE DATA
  displayDataInTable(columnHeaders, summaryDataset);
}

function updateDataSetToMatchSearchCriteria() {
  
  // FILTER BASED ON DROPDOWN VALUES
  datasetArrayForDisplay.length = 0; // First clear the contents of the array 
  for (i = 0; i < datasetArray.length; i++) {
    var includeRowToDataset = false; // used to decide if a given row should be added or not, first assuming it shouldn't
    
    // Filter based on year
    if (selectedDropdownValues[0].length != allDropdownValues[0].length) { // Check if any years were explicitly selected as criteria
      for (const year of selectedDropdownValues[0]) {
        if (datasetArray[i][0].includes(year)) { // If the selected year is in this row, then include row to the output dataset
          includeRowToDataset = true;
          break; // no need to keep looping since we want to include this row
        } else {
          includeRowToDataset = false;
        }
      }
    } else {
      includeRowToDataset = true; // If no year was selected, then it is not a filter critera and row should be included 
    }
    if (includeRowToDataset == false) {continue;} // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria

    // Filter based on location
    if (selectedDropdownValues[1].length != allDropdownValues[1].length) { // Check if any locations were explicitly selected as criteria
      for (const location of selectedDropdownValues[1]) {
        if (datasetArray[i][1].includes(location)) { // If the selected location is in this row, then include row to the output dataset
          includeRowToDataset = true;
          break; // no need to keep looping since we want to include this row
        } else {
          includeRowToDataset = false;
        }
      }
    } else {
      includeRowToDataset = true; // If no location was selected, then it is not a filter critera and row should be included 
    }
    if (includeRowToDataset == false) {continue;} // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria

    // Filter based on events
    if (selectedDropdownValues[2].length != allDropdownValues[2].length) { // Check if any events were explicitly selected as criteria
      for (const event of selectedDropdownValues[2]) {
        if (datasetArray[i][2].includes("#" + event)) { // If the selected event is in this row, then include row to the output dataset
          includeRowToDataset = true;
          break; // no need to keep looping since we want to include this row
        } else {
          includeRowToDataset = false;
        }
      }
    } else {
      includeRowToDataset = true; // If no event was selected, then it is not a filter critera and row should be included 
    }
    if (includeRowToDataset == false) {continue;} // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria

    // If row should not be excluded, then add it to the output array
    if (includeRowToDataset == true) {
      datasetArrayForDisplay.push(datasetArray[i]);
    }
  }

  // IF USER ONLY WANTS TO LIST EVENTS THEN REMOVE THE OTHER ENTRIES  
  if (selectedDisplayOption == "List: Event Lines") {
    // Retrieve the selected events from the events fields 
    var tempDataSet = []; // This will hold the data that will be displayed
    for (var row of datasetArrayForDisplay) {
      var eventLinesToAdd = ""; // will hold all the events of that cell
      var brIndices = getIndicesOf("<br>", row[2]) // Get all the indices of <br> in that cell
      brIndices.unshift(0); // Add 0 to the beginning for ease of looping over each line in that cell
      for (var i = 0; i < brIndices.length ; i++) { // Loop over the different lines in that cell
        for (var event of selectedDropdownValues[2]) { // Loop over every selected event to check if it's present in that line
          var line = row[2].substring(brIndices[i],brIndices[i+1]) + "<br>"; // Extract the line.
          if (line.includes("#" + event)) { // Now check if the line contains the event
            if (!eventLinesToAdd.includes(line)) { // If so then check if that line is not already there (useful for lines that have multiple tags)
              eventLinesToAdd += line; // If not then add it
            }
          }
        }
      }
      if (eventLinesToAdd != "") {
        tempDataSet.push([row[0], row[1], eventLinesToAdd]);
      }
    }
    datasetArrayForDisplay = tempDataSet.slice(0);
  }

  // FILTER BASED ON SEARCH WORD VALUE
  if (searchWord != '') {
    var tempArray = []; // Array to hold rows that match the searchword criteria
    for (const row of datasetArrayForDisplay) {
      if (row[0].toLowerCase().includes(searchWord.toLowerCase()) || row[1].toLowerCase().includes(searchWord.toLowerCase()) || row[2].toLowerCase().includes(searchWord.toLowerCase())) {
        tempArray.push(row);
      }
    }
    datasetArrayForDisplay = tempArray.slice();
  }
}
