function retrieveDataForTopPane() {
  let startTime = performance.now();
  // RETRIEVE THE YEARS LIST
  var currentYear = new Date().getFullYear();
  for (var year = currentYear; year >= 1984; year--) {
    allDropdownValues[0].push(year.toString());
  }

  // RETRIEVE THE LOCATIONS LIST
  // Iterate over every row in the table
  for (let i = 0; i < datasetArray.length; i++) {
    let rowLocationValueArray = datasetArray[i][1].split(","); // Get the city and country values in an array
    // Iterate over every city_country that day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array
      if (cityCountrySplitArray.length != 0) {

      }

      // Add city name to array
      let cityName = cityCountrySplitArray[0].trim();
      if (!cityName.includes("(") && !citiesListedInLocationDropdown.includes(cityName)) { 
          citiesListedInLocationDropdown.push(cityName); 
      }

      // Add country name to array
      let countryName = cityCountrySplitArray[1].trim();
      if (!countryName.includes(")") && !allDropdownValues[1].includes(countryName)) {
        allDropdownValues[1].push(countryName);
      }
    }
  }
  allDropdownValues[1].sort();
  citiesListedInLocationDropdown.sort();

  // RETRIEVE THE EVENTS LIST
  // First populate it from the provided list
  allDropdownValues[2] = datasetArray[datasetArray.length-1][3].split(";"); 
  
  // Then remove the last line as it is blank
  allDropdownValues[2].pop(); 

  // Then remove the breakline characters at the end of each entry as well as the events with -Sum or -DSum since we don't need to display them
  var indexToRemove = [];
  var currentArrayLength = allDropdownValues[2].length; // This is needed as the array may shrink down in size during cleanup
  for (let i=0; i < currentArrayLength; i++) {
    if (allDropdownValues[2][i].includes("<br>")) {
      allDropdownValues[2][i] = allDropdownValues[2][i].split("<br>")[1];
    }
  }
  // Then remove the events with -Sum and -DSum in their name since we dont need to display them. 
  // Commenting this out for now as the Summary view picks its columns from these same dropdown values, 
  // and so by removing these from here they are being removed from the Summary view, which defeats their purpose
  // one solution is to have another variable holding these values and which the Summary section references 
  /*for (let i=0; i < currentArrayLength; i++) {
    if (allDropdownValues[2][i].includes("-Sum") || allDropdownValues[2][i].includes("-DSum")) {
      allDropdownValues[2].splice(i, 1);
      currentArrayLength--;
    }
  }*/
  
  // RETRIEVE THE DISPLAY OPTIONS LIST
  var displayOptionsText = ["List: All Lines", "List: Event Lines", "List: Excel File", "GroupBy: Location"]; // This holds the options to display in the Display Options dropdown 
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
``}

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

function retrieveDataForUploadedFile() { 
  // Provide the column names for table to display data: 1- "Data", 2- "Location", and 3- Number of rows
  var columnHeaders = ["Date", "Location", "(" + datasetArray.length + " rows)"];

  // Display the data
  displayDataInTable(columnHeaders, datasetArray);

  // Set below datasets as they may be used in future user queries
  datasetBeforeKeywordFilter = datasetArray.slice();
  datasetAfterKeywordFilter = datasetArray.slice();
}

function retrieveDataForListTable() {
  let startTime = performance.now();
  
  // Filter dataset to only include lines from the 3 dropdown criteria 
  datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetArray, selectedDropdownValues[0], selectedDropdownValues[1], selectedDropdownValues[2]); 

  // Filter dataset to only include lines with the searchword
  if (!searchWord == "") {
    datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice();
  } else {
    datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
  }
  
  if (selectedDisplayOption == "List: Event Lines") {
    // Retrieve the selected events from the events fields 
    var tempDataSet = []; // This will hold the data that will be displayed
    for (var row of datasetAfterKeywordFilter) {
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
    datasetAfterKeywordFilter = tempDataSet.slice(0);
  }
  // Provide the column names for table to display data: 1- "Data", 2- "Location", and 3- Number of rows
  var columnHeaders = ["Date", "Location", "(" + datasetAfterKeywordFilter.length + " rows)"];

  console.log(`retrieveDataForListTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the data
  displayDataInTable(columnHeaders, datasetAfterKeywordFilter);

}

function retrieveDataforGroupByLocationTable() {   
  let startTime = performance.now();

  // Filter dataset to only include lines from the 3 dropdown criteria and 1 search word
  datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetArray, selectedDropdownValues[0], selectedDropdownValues[1], selectedDropdownValues[2]); 
  if (!searchWord == "") {
    datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice(0);
  } else {
    datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
  }
  
  // Iterate over content of newly defined location array in order to query it for matches
  var groupbyDataToDisplay = {}; // Dictionary that will have country names has keys, and number of occurences as values, to display in output
  for (var location of selectedDropdownValues[1]) {
    for (i = 0; i < datasetAfterKeywordFilter.length; i++) {
      if (datasetAfterKeywordFilter[i][1].includes(location) && !datasetAfterKeywordFilter[i][1].includes("(" + location) && !datasetAfterKeywordFilter[i][1].includes(location + ")")) {
        helperIncrementCount(location, groupbyDataToDisplay);
      }
    }
  }
  
  // Sort the array to have the countries with highest count first
  groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(groupbyDataToDisplay); 
  
  // Set the columnHeaders for use when displaying the table
  var columnHeaders = ["Locations", "Count"]; // To hold the column names for passing to the data display function

  console.log(`retrieveDataforGroupByLocationTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the group table
  displayDataInTable(columnHeaders, groupbyDataToDisplay);
}

function retrieveDataforSummaryTable() {
  let startTime = performance.now();
    
  // FILTER DATASET TO ONLY INCLUDE LINES FROM THE 3 DROPDOWN CRITERIA AND 1 SEARCH WORD
  datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetArray, selectedDropdownValues[0], selectedDropdownValues[1], selectedDropdownValues[2]); 
  if (searchWord == "") {
    datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
  } else {
    datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice(0);
  }
 
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
  for (var row of datasetAfterKeywordFilter) { // Loop over the filtered datasheet to identify the different months needed to be covered
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
  for (i = 0; i < datasetAfterKeywordFilter.length; i++) {
    
    // Get that row's date
    var cell_date = new Date(datasetAfterKeywordFilter[i][0]);
    var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
    
    // Iterate over each line in the row's event cell 
    var rowsFromEventsCell = datasetAfterKeywordFilter[i][2].split("<br>");
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
