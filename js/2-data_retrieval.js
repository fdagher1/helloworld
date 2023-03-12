function retrieveDataForTopPane() {
  // retrieve the years list
  var currentYear = new Date().getFullYear();
  yearList.push("All years");
  for (var year = currentYear; year >= 1984; year--) {
    yearList.push(year);
  }

  // retrieve the locations list
  // Iterate over every row in the table
  for (let i = 0; i < importedDataSet.length; i++) {
    let rowLocationValueArray = importedDataSet[i][1].split(","); // Get the city and country values in an array
    // Iterate over every city_country that day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array
      
      // Add city name to array
      let cityName = cityCountrySplitArray[0].trim();
      if (!cityName.includes("(") && !cityList.includes(cityName)) { 
          cityList.push(helperCapitalizeFirstLetter(cityName)); 
      }

      // Add country name to array
      let countryName = cityCountrySplitArray[1].trim();
      if (!countryName.includes(")") && !countryList.includes(countryName)) {
          countryList.push(helperCapitalizeFirstLetter(countryName));
      }
    }
  }
  countryList.sort().unshift("All countries");
  cityList.sort().unshift("All cities");

  // retrieve the events list
  eventList = importedDataSet[importedDataSet.length-1][3].split(";"); // First populate it from the provided list
  eventList.unshift("All events-All events"); // Then add the all events to it
  for (let i = 0; i < importedDataSet.length; i++) {
    var cell = importedDataSet[i][2];
    // Iterate over all the + entries in the same cell
    while (cell.includes("#")) { 
      let str = cell.slice(cell.indexOf("#"));
      cell = str.slice(str.indexOf(" ")); 
      let eventName = str.slice(1,str.indexOf(" "));
      if (eventName.includes(".")) { 
        eventName = eventName.slice(0, eventName.indexOf(".")); // This allows handling edge cases like +Workout.
      }
      eventName = helperCapitalizeFirstLetter(eventName); // Capitalize the first letter
      
      // Check if event name is not in the provided event list
      let unaccountedForEvent = true;
      for (let j = 0; j < eventList.length; j++) {
        if (eventList[j].includes(eventName)) {
          unaccountedForEvent = false;
          break;
        }
      }

      if (unaccountedForEvent) {
        eventList.push("Unaccounted-" + eventName);
      }
    }
  }
}
  
function retrieveDataforListTable(datasetToQuery, selectedYear, chosenLocation, chosenEvent, groupBy, searchWord) {
  // Set the below to blank for ease of querying and for displaying column header
  if (selectedYear.includes("All ")) { 
    selectedYear = ""; 
  }
  if (chosenLocation.includes("All ")) { 
    chosenLocation = ""; 
  } 

  // Define an array for all the event names you want to query for, as they may be 1 or many, or all 
  var eventsToList = [];
  if (chosenEvent.includes("All ")) { 
    // Set it to blank for better layout in the event column title
    chosenEvent = "";
    // All events were selected, and so either display all the lines, or only those with events, depending on what the user chose
    if (groupBy == "NoGrp-ShowLines") {
      eventsToList.push(""); 
    } else if (groupBy == "NoGrp-ShowEvents") {
      // If user chose to show events then build the array to contain all the event names
      for (var event of eventList) {
        eventsToList.push("#" + event.split("-")[1]);
      }
    }
  } else {
    // Since only one event was selected then put it in the array as a single entry
    eventsToList.push("#" + chosenEvent)
  }

  // Iterate over each row to find a match based on the 3 dropdowns
  var tempDataSet = [];
  for (var i = 0; i < datasetToQuery.length; i++) {
    if (helperCompareDates(datasetToQuery[i][0], selectedYear)) {
      if (datasetToQuery[i][1].includes(chosenLocation)) {
        if (groupBy == "NoGrp-ShowLines") {
          if (datasetToQuery[i][2].includes(eventsToList)) {
            tempDataSet.push([datasetToQuery[i][0], datasetToQuery[i][1], datasetToQuery[i][2]]);
          }
        } else if (groupBy == "NoGrp-ShowEvents") {
          var eventLine = ""; // will hold all the events of that line
          for (var event of eventsToList) {
            if (datasetToQuery[i][2].includes(event)) {
              //eventLine += datasetToQuery[i][2].slice(datasetToQuery[i][2].indexOf(event)).slice(0, datasetToQuery[i][2].slice(datasetToQuery[i][2].indexOf(event)).indexOf("\n")) + "<br>";
              // The below is a bit long because the line has to be sliced at the first \n that occurs AFTER the event
              let tempEventLine = ""; // will only hold one event in the line 
              tempEventLine = datasetToQuery[i][2].slice(datasetToQuery[i][2].indexOf(event));
              eventLine += tempEventLine.slice(0, tempEventLine.indexOf("<br>")) + "<br><br>";
            }
          }
          if (eventLine != "") {
            tempDataSet.push([datasetToQuery[i][0], datasetToQuery[i][1], eventLine]);
          }
        }
      }
    }
  }

  // Setting the content of lastDisplayedDataSet here rather than towards the end, as it should be done before the textbox content change (otherwise backspace wouldn't do anything)
  lastDisplayedDataSet = tempDataSet.slice(0);

  // Iterate over each row to find a match based on the keyword
  var dataSetToDisplay = [];
  for (const line of tempDataSet) {
    if (line[0].toLowerCase().includes(searchWord.toLowerCase()) || line[1].toLowerCase().includes(searchWord.toLowerCase()) || line[2].toLowerCase().includes(searchWord.toLowerCase())) {
      dataSetToDisplay.push(line);
    }
  }

  // Provide proper column names for table to display data then call function to do so
  let thirdColumnTitle = selectedYear + ", " + chosenLocation + ", " + chosenEvent;
  var columnNames = ["Date", "Location", thirdColumnTitle];
  displayDataInTable(columnNames, dataSetToDisplay);
}
  
function retrieveDataforGroupTable(selectedYear, selectedLocation, selectedEvent, groupBy) {
  // Define variables needed for the queries
  var queryYear;
  var queryLocation;
  var queryEvent;
  var columnNames;
  var filteredDataSet = []; // Data last displayed
  var groupbyDataToDisplay = {}; // Define the needed arrays for output

  // Set query words to "" if All was selected to treat them as a non criteria
  if (selectedYear.includes("All ")) { 
    queryYear = ""; 
  } else {
    queryYear = selectedYear;
  }

  if (selectedLocation.includes("All ")) { 
    queryLocation = ""; 
  } else {
    queryLocation = selectedLocation;
  }

  if (selectedEvent.includes("All ")) { 
    queryEvent = ""; 
  }  else {
    queryEvent = "#" + selectedEvent;
  }

  // Filter dataset based on the 3 dropdown criteria
  for (i = 0; i < importedDataSet.length; i++) {
    if (importedDataSet[i][0].includes(queryYear)) {
      if (importedDataSet[i][1].includes(queryLocation)) {
        if (importedDataSet[i][2].includes(queryEvent)) {
          filteredDataSet.push([importedDataSet[i][0], importedDataSet[i][1], importedDataSet[i][2]])
        }
      }
    }
  }

  // If group by Location then define the names to group by
  if (groupBy == "location") {
    switch(selectedLocation) {
      case "All countries":
        var queryLocation = countryList;
        break;

      case "All cities":
        var queryLocation = cityList;
        break;

      default:
        var queryLocation =[selectedLocation];
        break;
    }
    
    // Iterate over content of newly defined location array in order to query it for matches
    for (var location of queryLocation) {
      for (i = 0; i < filteredDataSet.length; i++) {
        if (filteredDataSet[i][1].includes(location) && !filteredDataSet[i][1].includes("(" + location) && !filteredDataSet[i][1].includes(location + ")")) {
          helperIncrementCount(location, groupbyDataToDisplay);
        }
      }
    }
    
    // Sort the array to have the countries with highest count first
    groupbyDataToDisplay = helperSortDictionaryIntoArray(groupbyDataToDisplay); 
    
    // Set the columnNames for use when displaying the table
    columnNames = ["Locations", "Count"]; 
  // If Event radio is selected
  } else if (groupBy == "event") {

    // If group by event, then define the names to group by
    if (selectedEvent.includes("All ")) {
      queryEvent = eventList.slice(0);
    } else {
      queryEvent = [selectedEvent];
    }

    // Iterate over each name in the query array in order to query it
    for (var event of queryEvent) {
      // Remove category prefix from the event name
      if (event.includes("-")) {
        event = event.split("-")[1];
      }
      tagName = "#" + event;
      // Iterate over each table row 
      for (i = 0; i < filteredDataSet.length; i++) {
        if (filteredDataSet[i][2].includes(tagName)){
          helperIncrementCount(event, groupbyDataToDisplay);
        }
      }
    }

    // Convert dict to array as the display functions assume input is array not dict
    groupbyDataToDisplay = Object.entries(groupbyDataToDisplay); 
    
    // Add the months column
    for (let i = 0; i < groupbyDataToDisplay.length; i++) { groupbyDataToDisplay[i].push("Months"); } 
    
    // Set the columnNames for use when displaying the table
    columnNames = ["Events", "Count", "Months"]; 
  } 

  // Display the group table
  displayGroupTable(groupbyDataToDisplay, columnNames, selectedYear, selectedLocation, selectedEvent, groupBy);
}
  
function retrieveDataforMonthsTable(selectedYear, selectedLocation, clickedEvent) {
  // Define the needed arrays for output
  var countSelectionOccurance_ByMonth = {};
  hashtag = "#" + clickedEvent;

  // Set year and location query words to "" if All was selected to allow making them a non criteria
  if (selectedYear.includes("All ")) { 
    selectedYear = ""; 
  }
  if (selectedLocation.includes("All ")) { 
    selectedLocation = ""; 
  }

  // Iterate over each table row and when there's a hit, increment occurance array for month-year combo
  for (i = 0; i < importedDataSet.length; i++) {
    if (importedDataSet[i][0].includes(selectedYear) && importedDataSet[i][1].includes(selectedLocation) && importedDataSet[i][2].includes(hashtag)){
      // Get the month and year from the date
      let date = importedDataSet[i][0];
      let mm = date.slice(date.indexOf(" ")+1, date.indexOf("/"));
      let yyyy = date.substring(date.length - 4); 
      // Increment count for that particular mm/yyyy string
      helperIncrementCount(mm + "/" + yyyy, countSelectionOccurance_ByMonth);
    }
  }

  // Convert the dictionary to an array for consistency (since the dicionary sorting helper function I have converts the dict to an array as well)
  countSelectionOccurance_ByMonth = Object.entries(countSelectionOccurance_ByMonth);

  displayMonthsTable(countSelectionOccurance_ByMonth, clickedEvent);
}