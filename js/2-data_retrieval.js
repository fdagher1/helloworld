function validateFileFormatAndData(){
  let startTime = performance.now();
  let errorMessage = "No errors";
  // VALIDATE EACH EVENT CELL
  let previousCellDate = new Date(datasetFromExcel[0][0]);
  for (let i = 0; i < datasetFromExcel.length; i++) { 
    
    // CHECK THAT DATES ARE IN DESCENDING ORDER
    let currentCellDate = new Date(datasetFromExcel[i][0]); 
    if (i == 0){ 
      // Do nothing as that means we're still in the first row and it's too early to check
    } else if (currentCellDate > previousCellDate) {
      errorMessage = "The dates in row number " + ++i + " should be in a descending order from the previous row.";
      break;
    }
    previousCellDate = currentCellDate;

    // CHECK THAT LOCATIONS ALL HAVE UNDERSCORES IN THEM
    let rowLocationValueArray = datasetFromExcel[i][1].split(","); // Get the city_country values in an array
    let errorFound = false;
    // Iterate over every city_country that day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      if (errorFound == false) {
        var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city_country into an array
        if (cityCountrySplitArray.length != 2) {
          errorMessage = "The location provided in row number " + ++i + " is missing an underscore.";
          errorFound = true;
        }
      }
    }
    if (errorFound == true) {
      break;
    }
    
    
    // CHECK EVENT ENTRY VALIDITY
    var event_cell = datasetFromExcel[i][2];
    
    // CHECK IF CELL IS BLANK
    if (typeof event_cell === 'undefined') {
      errorMessage = "The event cell in row number " + ++i + " is blank.";
      break;
    }

    // CHECK IF CELL DOES NOT END WITH A BREAK LINE
    if (event_cell.charAt(event_cell.length-1) != "\n") { // I found it odd that \n is treated as 1 character
      errorMessage = "The event cell in row " + ++i + " does not end with a line break.";
      break;
    }

    // CHECK IF CELL HAS NO HASHTAGS
    if (!event_cell.includes("#")) {
      errorMessage = "The event cell in row " + ++i + " does not have any events. It should have at least one.";
      break;
    }

    // CHECK IF THERE ARE EVENT TAGS THAT ARE NOT IN THE EVENT LIST
    // Retrieve the events list from the bottom cell
    eventsListedInEventsDropdown = datasetFromExcel[datasetFromExcel.length-1][3].split(";"); 
    // Check if there are any tags in the event cell that are missing from the list
    while (event_cell.includes("#")) { // Iterate over all the # entries in the same cell
      let new_event_cell = event_cell.slice(event_cell.indexOf("#")); // Remove anything before the first # in the cell
      event_cell = new_event_cell.slice(new_event_cell.indexOf(" ")); // Place anything after the first space from the tag in a new cell to iterate over once this is done 
      let eventName = new_event_cell.slice(1,new_event_cell.indexOf(" ")); // Get the tag name
      if (eventName.includes(".")) { 
        eventName = eventName.slice(0, eventName.indexOf(".")); // Remove the "." from the tag name if it happens to be linked to it. 
      }
      if (eventName.includes(",")) { 
        eventName = eventName.slice(0, eventName.indexOf(",")); // Remove the "," from the tag name if it happens to be linked to it. 
      }
      // Should we handle other cases than . and , like <br> perhaps?

      // Check if event name is not in the provided event list
      var event_is_in_list = false;
      for (let j = 0; j < eventsListedInEventsDropdown.length; j++) {
        if (eventsListedInEventsDropdown[j].split("_")[1] == eventName) {
          event_is_in_list = true;
          break;
        }
      }
      if (event_is_in_list == false){
        // Since the loop over the event list completed with no breaks, then the event name is missing
        errorMessage = "The event " + eventName + " found in row " + ++i + " is missing from the list.";
        break;
      }
    }
  }

  console.log(`validateFileFormatAndData executed in: ${performance.now() - startTime} milliseconds`);
  // If no errors, then return, otherwise, display error message
  if (errorMessage == "No errors") {
    return "file is valid"
  } else {
    displayFileValidityError(errorMessage);
  }
}

function retrieveDataForTopPane() {
  let startTime = performance.now();
  // RETRIEVE THE YEARS LIST
  var currentYear = new Date().getFullYear();
  for (var year = currentYear; year >= 1984; year--) {
    yearsListedInYearsDropdown.push(year);
  }

  // RETRIEVE THE LOCATIONS LIST
  // Iterate over every row in the table
  for (let i = 0; i < datasetFromExcel.length; i++) {
    let rowLocationValueArray = datasetFromExcel[i][1].split(","); // Get the city and country values in an array
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
      if (!countryName.includes(")") && !countriesListedInLocationDropdown.includes(countryName)) {
          countriesListedInLocationDropdown.push(countryName);
      }
    }
  }
  countriesListedInLocationDropdown.sort();
  citiesListedInLocationDropdown.sort();

  // RETRIEVE THE EVENTS LIST
  eventsListedInEventsDropdown = datasetFromExcel[datasetFromExcel.length-1][3].split(";"); // First populate it from the provided list
  eventsListedInEventsDropdown.pop(); // Then remove the last line as it is blank
  for (let i=0; i < eventsListedInEventsDropdown.length; i++) {
    if (eventsListedInEventsDropdown[i].includes("\r\n")) {
      eventsListedInEventsDropdown[i] = eventsListedInEventsDropdown[i].split("\r\n")[1];
    }
  }

  // RETRIEVE THE DISPLAY OPTIONS LIST
  displayOptionsListedInDisplayOptionsDropdown = ["List Excel File", "List All Lines", "List Event Lines", "Group By Location", "Summarize By Group 1", "Summarize By Group 2", "Summarize By Group 3", "Summarize By Group 4"];
  console.log(`retrieveDataForTopPane executed in: ${performance.now() - startTime} milliseconds`);
  displayDataInTopPane();
}

function retrieveDataFromTopPane() {
  let startTime = performance.now();
  // RETRIEVE SELECTED DATE(S), LOCATION(S), EVENT(S)
  // Clear content of the dropdown arrays before filling them again
  yearsListedInYearsDropdown.length = 0;
  countriesListedInLocationDropdown.length = 0;
  eventsListedInEventsDropdown.length = 0;
  selectedTime.length = 0;
  selectedLocations.length = 0;
  selectedEvents.length = 0;

  // Define new variables to use
  var elementIdsToGetDataFrom = ["timeItems", "locationItems", "eventItems"];
  var dropdownAllValues = [[], [], []];
  var dropdownSelectedValues = [[], [], []];
  
  // Loop over the 3 criteria dropdowns to get their corresponding: 1- values, and 2- select status (i.e., whether selected or not)
  for (let i=0; i < elementIdsToGetDataFrom.length; i++) {
    // Get an array of all the <li> children of the dropdown 
    var liElements = document.getElementById(elementIdsToGetDataFrom[i]).children;
    // Loop over each <li> entry to get its <input> child and then check if it's checked or unchecked
    for (const liElement of liElements) {
      var inputElement = liElement.children[0]; // the first child of the <li> element is the <input> element
      dropdownAllValues[i].push(inputElement.value); // Fill the dropdownAllValues array with all values
      
      // Fill the dropdownSelectedValues array with only selected values
      if (inputElement.checked) {
        if (inputElement.value.includes("_")) { // i.e., events
          dropdownSelectedValues[i].push(inputElement.value.split("_")[1]); 
        } else { // i.e., times and locations 
          dropdownSelectedValues[i].push(inputElement.value); 
        }
      }
    }
``}

  // If any of the selections are blank then fill the array with all of options (as if they were all selected)
  for (let i=0; i < dropdownSelectedValues.length; i++) {
    if (dropdownSelectedValues[i].length == 0) { // Meaning no values were selected
      if (i != 2) { // Meaning it's not events, then copy the data as is
        dropdownSelectedValues[i] = dropdownAllValues[i];
      } else { // Meaning it's events, then only display the part after the _ sign
        for (j=0; j<dropdownAllValues[i].length; j++) {
          dropdownSelectedValues[i].push(dropdownAllValues[i][j].split("_")[1]);
        }
      }
    }
  }

  // Set the variables from the parent script since those are globally accessible
  yearsListedInYearsDropdown = dropdownAllValues[0];
  countriesListedInLocationDropdown = dropdownAllValues[1];
  eventsListedInEventsDropdown = dropdownAllValues[2];
  selectedTime = dropdownSelectedValues[0];
  selectedLocations = dropdownSelectedValues[1];
  selectedEvents = dropdownSelectedValues[2];

  // RETRIEVE SELECTED DISPLAY OPTIONS
  selectedDisplayOption = document.getElementById("select-displayoption").value;

  // RETRIEVE THE TEXTBOX CONTENT
  searchWord = document.getElementById("textbox-keyword").value;
  if (searchWord == null) {
    searchWord == "";
  }
  console.log(`retrieveDataFromTopPane executed in: ${performance.now() - startTime} milliseconds`);
}

function retrieveExcelFileTable() { 
  // Provide the column names for table to display data: 1- "Data", 2- "Location", and 3- Number of rows
  var columnNames = ["Date", "Location", "(" + datasetFromExcel.length + " rows)"];

  // Display the data
  displayDataInTable(columnNames, datasetFromExcel);

  // Set below datasets as they may be used in future user queries
  datasetBeforeKeywordFilter = datasetFromExcel.slice();
  datasetAfterKeywordFilter = datasetFromExcel.slice();
}

function retrieveDataForLinesTable() {
  let startTime = performance.now();
  if (userAction == "Button Press") {   
    // Filter dataset to only include lines from the 3 dropdown criteria and 1 search word
    datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetFromExcel, selectedTime, selectedLocations, selectedEvents); 

    if (!searchWord == "") {
      datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice(0);
    } else {
      datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
    }
    
    if (selectedDisplayOption == "List Event Lines") {
      // Retrieve the selected events from the events fields 
      var tempDataSet = []; // This will hold the data that will be displayed
      for (var row of datasetAfterKeywordFilter) {
        var eventLinesToAdd = ""; // will hold all the events of that cell
        var brIndices = getIndicesOf("<br>", row[2]) // Get all the indices of <br> in that cell
        brIndices.unshift(0); // Add 0 to the beginning for ease of looping over each line in that cell
        for (var i = 0; i < brIndices.length ; i++) { // Loop over the different lines in that cell
          for (var event of selectedEvents) { // Loop over every selected event to check if it's present in that line
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
    var columnNames = ["Date", "Location", "(" + datasetAfterKeywordFilter.length + " rows)"];

    console.log(`retrieveDataForLinesTable executed in: ${performance.now() - startTime} milliseconds`);
    // Display the data
    displayDataInTable(columnNames, datasetAfterKeywordFilter);
  } else if (userAction == "Textbox Change") {
    if (!searchWord == "") { // To avoid unnecessary query
      datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice();
    } else {
      datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
    }

    // Provide the column names for table to display data: 1- "Data", 2- "Location", and 3- Number of rows
    var columnNames = ["Date", "Location", "(" + datasetAfterKeywordFilter.length + " rows)"];

    console.log(`retrieveDataForLinesTable executed in: ${performance.now() - startTime} milliseconds`);
    // Display the data
    displayDataInTable(columnNames, datasetAfterKeywordFilter);
  }

}

function retrieveDataforGroupByLocationTable() {   
  let startTime = performance.now();

  // Filter dataset to only include lines from the 3 dropdown criteria and 1 search word
  datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetFromExcel, selectedTime, selectedLocations, selectedEvents); 
  if (!searchWord == "") {
    datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice(0);
  } else {
    datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
  }
  
  // Iterate over content of newly defined location array in order to query it for matches
  var groupbyDataToDisplay = {}; // Dictionary that will have country names has keys, and number of occurences as values, to display in output
  for (var location of selectedLocations) {
    for (i = 0; i < datasetAfterKeywordFilter.length; i++) {
      if (datasetAfterKeywordFilter[i][1].includes(location) && !datasetAfterKeywordFilter[i][1].includes("(" + location) && !datasetAfterKeywordFilter[i][1].includes(location + ")")) {
        helperIncrementCount(location, groupbyDataToDisplay);
      }
    }
  }
  
  // Sort the array to have the countries with highest count first
  groupbyDataToDisplay = helperSortDictionaryIntoArray(groupbyDataToDisplay); 
  
  // Set the columnNames for use when displaying the table
  var columnNames = ["Locations", "Count"]; // To hold the column names for passing to the data display function

  console.log(`retrieveDataforGroupByLocationTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the group table
  displayDataInTable(columnNames, groupbyDataToDisplay);
}

function retrieveDataforSummaryTable() {
  let startTime = performance.now();
  // IDENTIFY THE EVENTS TO QUERY DEPENDING ON THE SUMMARY OPTION THAT THE USER CHOSE
  // retrieve the categories from the events list
  var eventCategories = [];
  for (line of eventsListedInEventsDropdown) {
    let eventCategory = line.split("_")[0];
    if (!eventCategories.includes(eventCategory)) {
      eventCategories.push(eventCategory);
    }
  }
  // Create the list to query based on the Option number selected by the user
  var eventsToQuery = [];
  for (line of eventsListedInEventsDropdown) {
    if (line.includes(eventCategories[selectedDisplayOption[19]-1])) {
      eventsToQuery.push(line.split("_")[1]);
    }
  }
  
  // FILTER DATASET TO ONLY INCLUDE LINES FROM THE 3 DROPDOWN CRITERIA AND 1 SEARCH WORD
  datasetBeforeKeywordFilter = helperReturnRowsThatMatchDropdowns(datasetFromExcel, selectedTime, selectedLocations, selectedEvents); 
  if (!searchWord == "") {
    datasetAfterKeywordFilter = helperReturnRowsThatMatchSearchWord(datasetBeforeKeywordFilter, searchWord).slice(0);
  } else {
    datasetAfterKeywordFilter = datasetBeforeKeywordFilter.slice();
  }
 
  // ITERATE OVER THE DATASET TO FIND MATCHES
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
  // Iterate over the datasheet to count the hits for tags
  for (i = 0; i < datasetAfterKeywordFilter.length; i++) {
    for (const eventToQuery of eventsToQuery) {
      // Get the date
      var cell_date = new Date(datasetAfterKeywordFilter[i][0]);
      var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
      // Check if the tag matches. First remove the suffix, such as the -Sum from #Pay-Sum
      if (datasetAfterKeywordFilter[i][2].includes("#" + eventToQuery.split("-")[0]))  {
        if (!eventToQuery.includes("-Sum")) { // Check that the tag is not for Sum
          countByMonth[month_year][eventToQuery] += 1 // Increment count in dictionary
        } else { // Else assume it is for Sum and sum the numbers found but only when prefixed by "$"
          // Get the #Pay line from that cell
          let payLine = datasetAfterKeywordFilter[i][2].slice(datasetAfterKeywordFilter[i][2].indexOf("#" + eventToQuery.split("-")[0]));
          payLine = payLine.slice(0, payLine.indexOf("<br>")); // THIS CAN POSSIBLY BE MERGED WITH THE TOP LINE AT SOME POINT
          var paySumTotal = helperGetTotalAmountFromLine(payLine); // Get the pay amount from that cell
          countByMonth[month_year][eventToQuery] += paySumTotal; // Increment the count in dictionary
        }
      }
    }
  }
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

  // Update the column names to include the count in them so they can appear in the table header
  var columnHeaderNames = [];
  for (tag of eventsToQuery) { // Iterate over every column (i.e. tag) 
    // Iterate over every row (i.e. month) in this column in order to sum the total to later display it in the header
    let totalCount = 0;
    for (let monthYearDictionaryKey in countByMonth) {
      totalCount += countByMonth[monthYearDictionaryKey][tag];
    }

    // Compile the column name
    let columnHeaderName;
    if (!tag.includes("-Sum")) {
      columnHeaderName = tag + "(" + totalCount.toString() + ")";
    } else {
      columnHeaderName = tag + "($" + totalCount.toString() + ")";
    }

    // Add the new column name to the column names array
    columnHeaderNames.push(columnHeaderName);
  }

  // Create the column names for use when displaying the data
  var columnNames = ["Month"].concat(columnHeaderNames);

  console.log(`retrieveDataforSummaryTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the data
  displayDataInTable(columnNames, summaryDataset);
}
