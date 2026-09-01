function retrieveDefaultInputValues() {
  // Get default date and location values
  let defaultDate = "dummydate"; // since we dont need a default date
  let defaultLocation = datasetArray[datasetArray.length-1][1]; 

  // Get default events and thoughts along with validated tags list
  // Same code needed for events and thoughts so I placed it in array
  let defaultEventAndThoughts = [];
  const splitKeyword = "Validated:";
  for (let i=0; i<2; i++) {
    let cellContent = datasetArray[datasetArray.length-1][i+2];
    let keywordIndex = cellContent.indexOf(splitKeyword); 
    if (keywordIndex == -1) {
      // EXIT
    } 
    let cellContentFirstSection = cellContent.slice(0, keywordIndex);
    let cellContentSecondSection = cellContent.slice(keywordIndex + splitKeyword.length);
  
    // Get default validated tags
    let defaultApprovedTagsArray = cellContentSecondSection.split(";");
    let defaultIgnoredTagsArray = []; // This will hold the events that are to be ignored when checking for errors in the event cell
    defaultApprovedTagsArray.pop(); // Remove the last empty entry from the array
    // Then remove the breakline characters at the beginning of each entry
    for (let i=0; i < defaultApprovedTagsArray.length; i++) {
      if (defaultApprovedTagsArray[i].includes("\n")) {
        defaultApprovedTagsArray[i] = defaultApprovedTagsArray[i].split("\n")[1];
      }
    }
    // Then move the events with Ignore_ in their name to a different array so that they are not considered as errors when checking the event cell 
    let tempApprovedTagsArray = [];
    for (let j=0; j < defaultApprovedTagsArray.length; j++) {
      if (defaultApprovedTagsArray[j].includes("Ignore_")) { //If the event category is Ignore, then add it to the Ignore array (will be used later to not consider such events as errors)
        defaultIgnoredTagsArray.push(defaultApprovedTagsArray[j]);
      } else {
        tempApprovedTagsArray.push(defaultApprovedTagsArray[j]);  
      }
    }
    defaultApprovedTagsArray = tempApprovedTagsArray.slice(); // Set existing array equal to the new/cleaned one
    defaultEventAndThoughts.push(cellContentFirstSection);
    defaultEventAndThoughts.push(defaultApprovedTagsArray);
    defaultEventAndThoughts.push(defaultIgnoredTagsArray);
  }

  // Get default country suffix 
  let defaultCountrySuffix = defaultLocation.match(/_([^_]+)$/)[1] // Get the country suffix from the default location (the part after the last underscore)
  
  // Store the default values in an array for later use
  defaultInputValues = [defaultDate, defaultLocation, defaultEventAndThoughts[0], defaultEventAndThoughts[3], defaultCountrySuffix, defaultEventAndThoughts[1], defaultEventAndThoughts[2], defaultEventAndThoughts[4], defaultEventAndThoughts[5]]; 
}

function retrieveDataForTopPane() {
  let startTime = performance.now();
  
  // RETRIEVE THE YEARS LIST
  allDropdownValues[0].length = 0; // clear array content in case it was previously filled
  var endingYear = new Date(datasetArray[1][0]).getFullYear();
  var startingYear = new Date(datasetArray[datasetArray.length-2][0]).getFullYear();
  for (var year = endingYear; year >= startingYear; year--) {
    allDropdownValues[0].push(year.toString());
  }
  allDropdownValues[0].unshift("All Years");

  // RETRIEVE THE LOCATIONS LIST
  // Iterate over every row in the table
  allDropdownValues[1].length = 0; // clear array content in case it was previously filled
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
  allDropdownValues[1].unshift("All Locations");

  // RETRIEVE THE EVENTS LIST
  allDropdownValues[2].length = 0; // clear array content in case it was previously filled
  allDropdownValues[2] = defaultInputValues[5].slice(); // Set the events array equal to the default validated events array
  allDropdownValues[2].unshift("All Events");

  // RETRIEVE THE THOUGHTS LIST
  allDropdownValues[3].length = 0; // clear array content in case it was previously filled
  allDropdownValues[3] = defaultInputValues[7].slice(); // Set the thoughts array equal to the default validated thoughts array
  allDropdownValues[3].unshift("All Thoughts");

  // RETRIEVE THE DISPLAY OPTIONS LIST
  var displayOptionsText = ["List: Events & Thoughts", "List: Events & Thoughts (today)", "List: Events (All)", "List: Thoughts (All)", "List: Events (Tagged)", "List: Thoughts (Tagged)", "Country grouping of days", "US State grouping of days", "City grouping of days", "Monthly grouping of Countries", "Monthly grouping of US States", "Monthly grouping of Cities"]; // This holds the options to display in the Display Options dropdown 
  var eventCategories = []; // This will hold the variable event categories to be used in the display
  for (eventName of allDropdownValues[2].slice(1)) { // The slice is to remove the first element "All"
    var eventCategory = eventName.split("_")[0];
    if (!eventCategories.includes(eventCategory)) {
      eventCategories.push(eventCategory);
      displayOptionsText.push("Summary(ev): " + eventCategory);
    }
  }
  var thoughtCategories = []; // This will hold the variable event categories to be used in the display
  for (thoughtName of allDropdownValues[3].slice(1)) { // The slice is to remove the first element "All"
    var thoughtCategory = thoughtName.split("_")[0];
    if (!thoughtCategories.includes(thoughtCategory)) {
      thoughtCategories.push(thoughtCategory);
      displayOptionsText.push("Summary(th): " + thoughtCategory);
    }
  }
  
  allDisplayOptions = displayOptionsText.slice();

  console.log(`retrieveDataForTopPane executed in: ${performance.now() - startTime} milliseconds`);
  displayDataInTopPane();
}

function retrieveDataFromTopPane() {
  let startTime = performance.now();

  // Collect the 4 criteria dropdowns values
  selectedDropdownValues[0] = document.getElementById("select-year").value;
  selectedDropdownValues[1] = document.getElementById("select-location").value;
  selectedDropdownValues[2] = document.getElementById("select-event").value;
  selectedDropdownValues[3] = document.getElementById("select-thought").value;

  // Retrieve the selected display option 
  selectedDisplayOption = document.getElementById("select-displayoption").value;

  // Retrieve the entered keyword 
  searchWord = document.getElementById("textbox-keyword").value;
  if (searchWord == null) {
    searchWord = "";
  }
  console.log(`retrieveDataFromTopPane executed in: ${performance.now() - startTime} milliseconds`);
}

function retrieveDataForListView(isEditableDisplayMode) {
  let startTime = performance.now();

  console.log(`retrieveDataForListView executed in: ${performance.now() - startTime} milliseconds`);

  // Display the data
  displayListOutput(datasetArrayForDisplay, isEditableDisplayMode);
  
}

function retrieveDataForGroupByLocationTable() {
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

      // Add state name to dictionary if country is USA and state is not already there, otherwise increment count
      if (countryName == "USA") { 
        let stateName = helperSplitStringLastOccurrence(cityName, " ");
        if(!locationsAddedForThisDay[1].includes(stateName)) {
          helperIncrementCount(stateName, countOfLocationDictionaryArray[1]);
          locationsAddedForThisDay[1].push(stateName);
        }
      }
    }
  }
  
  // Check which display option the user selected in order to determine what to sort and then to output it 
  if (selectedDisplayOption == "Country grouping of days") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[2]);
  } else if (selectedDisplayOption == "US State grouping of days") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[1]);
  } else if (selectedDisplayOption == "City grouping of days") {
    groupbyDataToDisplay = helperReturnSortedArrayFromDictionary(countOfLocationDictionaryArray[0]);
  }
  
  // Set the columnHeaders for use when displaying the table
  var columnHeaders = ["Locations (" + groupbyDataToDisplay.length + ")", "Count (" + helperSumSecondElement(groupbyDataToDisplay) + ")"]; // To hold the column names for passing to the data display function

  console.log(`retrieveDataforGroupByLocationTable executed in: ${performance.now() - startTime} milliseconds`);
  // Display the group table
  displayTableOutput(columnHeaders, groupbyDataToDisplay);
}

function retrieveDataForGroupByMonthTable() {
  let startTime = performance.now();
  // This function is similar to the retrieveDataforSummaryTable function but it is specific for the "Places Visited By Month" display option, which has a different format than the other summary options

  // If datasetArrayForDisplay includes the Default Values row then remove it first
  if (datasetArrayForDisplay[datasetArrayForDisplay.length-1][0] == "_DefaultValues_") {
    datasetArrayForDisplay.pop();
  }

  // Based on user selection, determine which type of places to display (cities, states, or countries) 
  var displayType = "city"; // Default to city
  var placesTypeLabel = "Cities";
  if (selectedDisplayOption.includes("Countries")) {
    displayType = "country";
    placesTypeLabel = "Countries";
  } else if (selectedDisplayOption.includes("US States")) {
    displayType = "state";
    placesTypeLabel = "States";
  } 

  // Compile the month/year array based on the dates in the dataset
  var month_year_arr = []; // holds the month/year array  
  for (var row of datasetArrayForDisplay) { // Loop over the filtered datasheet to identify the different months needed to be covered, excluding
    var month_year = (new Date(row[0]).getMonth()+1).toString() +"/" + new Date(row[0]).getFullYear().toString(); //Adding 1 to month as it starts from 0
    if (!month_year_arr.includes(month_year)) {
      month_year_arr.push(month_year);
    }
  }

  // Build the dictionary that will hold the places visited for each month
  var placesbyMonth = {};
  for (let month_year of month_year_arr) {
    placesbyMonth[month_year] = [];
  }

  // Iterate over the dataset to compile the places visited in each month
  for (let i = 0; i < datasetArrayForDisplay.length; i++) {
    
    // Get that row's date
    var cell_date = new Date(datasetArrayForDisplay[i][0]);
    var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
    
    // Extract places from the location cell (column 1)
    let rowLocationValueArray = datasetArrayForDisplay[i][1].split(","); // Place each location from that day in an array
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array
      let placeName = "";
      
      if (displayType === "country") {
        // Extract country name
        placeName = cityCountrySplitArray[1].trim();
        if (placeName.includes(")")) {
          placeName = ""; // Skip invalid entries
        }
      } else if (displayType === "state") {
        // Extract state name (only for USA)
        let countryName = cityCountrySplitArray[1].trim();
        if (countryName == "USA") { // Check if country is USA
          let cityName = cityCountrySplitArray[0].trim();
          placeName = helperSplitStringLastOccurrence(cityName, " "); // Extract state from city name
        }
      } else {
        // Extract city name (default)
        placeName = cityCountrySplitArray[0].trim();
        if (placeName.includes("(")) {
          placeName = ""; // Skip invalid entries
        }
      }
      
      // Add place name to the month's array if not already there and if valid
      if (placeName != "" && !placesbyMonth[month_year].includes(placeName)) {
        placesbyMonth[month_year].push(placeName);
      }
    }
  }

  // PREPARE DATA FOR OUTPUT
  
  // Convert the placesbyMonth dictionary to an array of arrays for use in the display data function
  var placesDataset = [];
  for (let monthYearDictionaryKey in placesbyMonth) {
    var rowToAdd = [];
    // First push the month/year as the first value
    rowToAdd.push(monthYearDictionaryKey);
    // Then push the count of places and the place names
    rowToAdd.push(placesbyMonth[monthYearDictionaryKey].length); // Count of unique places
    rowToAdd.push(placesbyMonth[monthYearDictionaryKey].join(", ")); // Comma-separated list of places
    placesDataset.push(rowToAdd);
  }

  // Create the table header with dynamic labels
  var columnHeaders = ["Month", placesTypeLabel + " Count", placesTypeLabel + " Visited"];

  console.log(`retrieveDataForGroupByMonthTable executed in: ${performance.now() - startTime} milliseconds`);
  
  // DISPLAY THE DATA
  displayTableOutput(columnHeaders, placesDataset);
}

function retrieveDataforSummaryTable(eventOrThought) {
  let startTime = performance.now();

  // Check if we are summarizing events or thoughts
  let indexToQuery;
  if (eventOrThought == "event") { indexToQuery=2;}
  if (eventOrThought == "thought") { indexToQuery=3;}

  // ITERATE OVER THE DATASET TO FIND MATCHES WITH THE TAGS FROM THE USER'S SUMMARY CHOICE
  // Compile event list of interest based on the user's summary selection
  var tagsToQuery = [];
  for (tagName of allDropdownValues[indexToQuery]) {
    if (tagName.includes(selectedDisplayOption.split(" ")[1])) { // i.e., take after the word "Summary: "
      tagsToQuery.push(tagName.split("_")[1]);
    }
  }

  // Compile the month/year array based on the dates in the dataset
  var month_year_arr = []; // holds the month/year array
  datasetArrayForDisplay.pop() // remove the last line since it doesnt have a date
  for (var row of datasetArrayForDisplay) { // Loop over the filtered datasheet to identify the different months needed to be covered
    var month_year = (new Date(row[0]).getMonth()+1).toString() +"/" + new Date(row[0]).getFullYear().toString(); //Adding 1 to month as it starts from 0
    if (!month_year_arr.includes(month_year)) {
      month_year_arr.push(month_year);
    }
  }
  
  // Build the dictionary that will hold the count of each event in each month (dictionary of a dictionaries), Ex: countByMonth["1/2023"]["#Workout"] = 0; 
  var countByMonth = {};
  var averageByMonth = {}; // For the events that have the average keyword in them, this will hold the average value for that month, instead of the count
  for (let month_year of month_year_arr) {
    countByMonth[month_year] = {};
    averageByMonth[month_year] = {};
    for (let tagToQuery of tagsToQuery) {
      let temp_month_year_dict = {};
      temp_month_year_dict[tagToQuery] = 0;
      countByMonth[month_year] = Object.assign(countByMonth[month_year], temp_month_year_dict); // This is needed as countByMonth[tagToQuery] = {month_year: 0}; results in month_year used as value 
      if (tagToQuery.includes("(avg)")) { // If event has the average keyword
        averageByMonth[month_year] = Object.assign(averageByMonth[month_year], temp_month_year_dict); // This is needed as averageByMonth[tagToQuery] = {month_year: 0}; results in month_year used as value 
      }
    }
  }
  
  // Iterate over the datasheet to count or sum the hits for each selected tag
  for (i = 0; i < datasetArrayForDisplay.length; i++) {
    
    // Get that row's date
    var cell_date = new Date(datasetArrayForDisplay[i][0]);
    var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
    
    // Iterate over each line in the row's event cell 
    var linesFromCell = datasetArrayForDisplay[i][indexToQuery].split("\n");
    for (lineFromCell of linesFromCell) {
      // Check if line has hashtag sign first to save time from iterating for each selected event later
      if (lineFromCell.includes("#")) {
        for (const tagToQuery of tagsToQuery) { // Iterate over every selected event to check for matches 
          if (lineFromCell.includes("#" + tagToQuery))  { // If event found
            if (tagToQuery.includes("(avg)")) { // If event has the average keyword
              averageByMonth[month_year][tagToQuery] = helperAverageValue(lineFromCell, countByMonth[month_year][tagToQuery], averageByMonth[month_year][tagToQuery]); // Calculate the average value
            }
            countByMonth[month_year][tagToQuery] += 1 // Increment count in dictionary
          }
        }
      }
    }
  }

  // For the events that have the average keyword in them, replace the count with the average value calculated
  for (const outerKey in countByMonth) {
    if (averageByMonth.hasOwnProperty(outerKey)) {
      for (const innerKey in countByMonth[outerKey]) {
        if (averageByMonth[outerKey].hasOwnProperty(innerKey)) {
          countByMonth[outerKey][innerKey] = averageByMonth[outerKey][innerKey];
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
  var totalCount;
  for (tag of tagsToQuery) { // Iterate over every column (i.e. tag) 
    totalCount = 0;
    for (let monthYearDictionaryKey in countByMonth) { // Iterate over every row (i.e. month) in this column in order to sum the total to later display it in the header
      totalCount += Number(countByMonth[monthYearDictionaryKey][tag]);
    }

    // If the tag has the average keyword, then calculate the average value across the different months and display that in the header instead of the total count
    if (tag.includes("(avg)")) {
      let nonzeromonth_year_arr = []; // This will hold the month_year entries that have a non zero value for this tag, which will be used to calculate the average value across the different months
      for (let monthYearDictionaryKey in countByMonth) {
        if (Number(countByMonth[monthYearDictionaryKey][tag]) != 0) {
          nonzeromonth_year_arr.push(monthYearDictionaryKey);
        }
      }
      let averageValue = totalCount / nonzeromonth_year_arr.length; // Calculate the average value across the different months
      averageValue = averageValue.toFixed(1); // Limit to 1 decimal
      totalCount = averageValue;
    }
    columnHeaders.push(tag + "(" + totalCount.toString() + ")");
  }

  console.log(`retrieveDataforSummaryTable executed in: ${performance.now() - startTime} milliseconds`);
  
  // DISPLAY THE DATA
  displayTableOutput(columnHeaders, summaryDataset);
}

function updateDataSetToMatchSearchCriteria() {
  let startTime = performance.now();

  // FILTER BASED ON DROPDOWN VALUES
  datasetArrayForDisplay.length = 0; // First clear the contents of the array 
  for (i = 0; i < datasetArray.length; i++) { // Iterate over every row 
    var includeRowToDataset = false; // assume row should not be included in dataset
    
    // Filter based on year
    if (selectedDropdownValues[0].includes("All")) { // Check if any year was explicitly selected as criteria
      includeRowToDataset = true; // If no year was selected, then it is not a filter critera and row should be included 
    } else { // else check if the selected value is in this row
      if (datasetArray[i][0].includes(selectedDropdownValues[0])) { // If the selected year is in this row, then include row to the output dataset
        includeRowToDataset = true;
      } else {
        includeRowToDataset = false;
        continue; // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria
      }
    }

    // Filter based on location
    if (selectedDropdownValues[1].includes("All")) { // Check if any location was explicitly selected as criteria
      includeRowToDataset = true; // If no location was selected, then it is not a filter critera and row should be included 
    } else { // else check if the selected value is in this row
      if (datasetArray[i][1].includes(selectedDropdownValues[1])) { // If the selected location is in this row, then include row to the output dataset
        includeRowToDataset = true;
      } else {
        includeRowToDataset = false;
        continue; // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria
      }
    }

    // Filter based on events
    if (selectedDropdownValues[2].includes("All")) { // Check if any event was explicitly selected as criteria. 
      includeRowToDataset = true; // If no event was selected, then it is not a filter critera and row should be included   
    } else { // else check if the selected value is in this row
      if (datasetArray[i][2].includes("#" + selectedDropdownValues[2].split("_")[1])) { // If the selected event is in this row, then include row to the output dataset
        includeRowToDataset = true;
      } else {
        includeRowToDataset = false;
        continue; // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria
      }
    }

    // Filter based on thoughts
    if (selectedDropdownValues[3].includes("All")) { // Check if any thought was explicitly selected as criteria. 
      includeRowToDataset = true; // If no thought was selected, then it is not a filter critera and row should be included   
    } else { // else check if the selected value is in this row
      if (datasetArray[i][3].includes("#" + selectedDropdownValues[3].split("_")[1])) { // If the selected thought is in this row, then include row to the output dataset
        includeRowToDataset = true;
      } else {
        includeRowToDataset = false;
        continue; // If row should not be included per this criteria, then go to next row, since there's no point checking for other criteria
      }
    }

    // If row should not be excluded, then add it to the output array
    if (includeRowToDataset == true) {
      datasetArrayForDisplay.push(datasetArray[i]);
    }
  }

  // IF USER ONLY WANTS TO LIST TAGGED EVENTS OR THOUGHTS THEN REMOVE THE OTHER NON TAGGED LINES FROM THE EVENTS CELL 
  if (selectedDisplayOption == "List: Events (Tagged)" || selectedDisplayOption == "List: Thoughts (Tagged)") {
    // Set the search index for the array based on what the user selected 
    let indexToQuery;
    if (selectedDisplayOption == "List: Events (Tagged)") { indexToQuery=2;}
    if (selectedDisplayOption == "List: Thoughts (Tagged)") { indexToQuery=3;}
    
    // Retrieve the selected tags from the events or thoughts fields 
    var tempDataSet = []; // This will hold the data that will be displayed
    for (var displayRowIndex = 0; displayRowIndex < datasetArrayForDisplay.length; displayRowIndex++) {
      var row = datasetArrayForDisplay[displayRowIndex];
      var eventOrThoughtLinesToAdd = ""; // will hold all the events of that cell
      var brIndices = getIndicesOf("\n", row[indexToQuery]) // Get all the indices of \n in that cell
      brIndices.unshift(0); // Add 0 to the beginning for ease of looping over each line in that cell
      for (var i = 0; i < brIndices.length ; i++) { // Loop over the different lines in that cell
        let tagsToQuery = [];
        if (selectedDropdownValues[indexToQuery].includes("All")) { // If user selected All, then loop over all the events/thoughts to check if it's present in that line
          tagsToQuery = allDropdownValues[indexToQuery].slice(1); // The slice is to remove the first element "All"
        } else {
          tagsToQuery[0] = selectedDropdownValues[indexToQuery];
        }
        for (var eventOrThought of tagsToQuery) { 
          var line = row[indexToQuery].substring(brIndices[i],brIndices[i+1]) + "\n"; // Extract the line.
          if (line.includes("#" + eventOrThought.split("_")[1])) { // Now check if tag is present
            if (!eventOrThoughtLinesToAdd.includes(line)) { // If so then check if that line is not already there (useful for lines that have multiple tags)
              eventOrThoughtLinesToAdd += line; // If not then add it
            }
          }
        }
      
      }
      if (eventOrThoughtLinesToAdd != "") {
        if (selectedDisplayOption == "List: Events (Tagged)") { tempDataSet.push([row[0], row[1], eventOrThoughtLinesToAdd, ""]);}
        if (selectedDisplayOption == "List: Thoughts (Tagged)") { tempDataSet.push([row[0], row[1], "", eventOrThoughtLinesToAdd]);}
      }
    }
    datasetArrayForDisplay = tempDataSet.slice(0);
  }

  // FILTER BASED ON SEARCH WORD VALUE, ONLY IF THE SEARCH WORD HAS MORE THAN 2 CHARACTERS TO AVOID OVER FILTERING FROM SHORT COMMON WORDS
  if (searchWord.length > 2) { 
    var tempArray = []; // Array to hold rows that match the searchword criteria
    for (let displayRowIndex = 0; displayRowIndex < datasetArrayForDisplay.length; displayRowIndex++) {
      const row = datasetArrayForDisplay[displayRowIndex];
      if (row[0].toLowerCase().includes(searchWord.toLowerCase()) || row[1].toLowerCase().includes(searchWord.toLowerCase()) || row[2].toLowerCase().includes(searchWord.toLowerCase()) || row[3].toLowerCase().includes(searchWord.toLowerCase())) {
        tempArray.push(row);
      }
    }
    datasetArrayForDisplay = tempArray.slice();
  }

  console.log(`updateDataSetToMatchSearchCriteria executed in: ${performance.now() - startTime} milliseconds`);
}
