function validateFileFormatAndData(){
  // VALIDATE EACH EVENT CELL
  for (let i = 0; i < importedDataSet.length; i++) { 
    var event_cell = importedDataSet[i][2]; // retrieve the event cell content
    
    // CHECK IF CELL IS BLANK
    if (typeof event_cell === 'undefined') {
      return "The event cell in row number " + ++i + " is blank.";
    }

    // CHECK IF CELL DOES NOT END WITH A BREAK LINE
    if (event_cell.charAt(event_cell.length-1) != "\n") { // I found it odd that \n is treated as 1 character
      return "The event cell in the row after row number " + ++i + " does not end with a line break.";
    }

    // CHECK IF THERE ARE CELL TAGS THAT ARE NOT IN THE EVENT LIST ALREADY
    // Retrieve the events list from the bottom cell
    eventList = importedDataSet[importedDataSet.length-1][3].split(";"); 
    // Check if there are any tags in the event cell that are missing from the list
    while (event_cell.includes("#")) { // Iterate over all the # entries in the same cell
      let new_event_cell = event_cell.slice(event_cell.indexOf("#")); // Remove anything before the first # in the cell
      event_cell = new_event_cell.slice(new_event_cell.indexOf(" ")); // Place anything after the first space from the tag in a new cell to iterate over once this is done 
      let eventName = new_event_cell.slice(1,new_event_cell.indexOf(" ")); // Get the tag name
      if (eventName.includes(".")) { 
        eventName = eventName.slice(0, eventName.indexOf(".")); // Remove the "."" from the tag name if it happens to be linked to it. 
        // Should we handle cases like +Workout<br>
      }
      // Check if event name is not in the provided event list
      var event_is_in_list = false;
      for (let j = 0; j < eventList.length; j++) {
        if (eventList[j].includes("-"+eventName)) {
          event_is_in_list = true;
          break;
        }
      }
      if (event_is_in_list == false){
        // Since the loop over the event list completed with no breaks, then the event name is missing
        return "The event " + eventName + " found in the row after row number " + ++i + " is missing from the list.";
      }
    }
  }

  // Since no errors returned, return "file is valid" instead
  return "file is valid";
}

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
          cityList.push(cityName); 
      }

      // Add country name to array
      let countryName = cityCountrySplitArray[1].trim();
      if (!countryName.includes(")") && !countryList.includes(countryName)) {
          countryList.push(countryName);
      }
    }
  }
  countryList.sort().unshift("All countries");
  cityList.sort().unshift("All cities");

  // retrieve the events list
  eventList = importedDataSet[importedDataSet.length-1][3].split(";"); // First populate it from the provided list
  eventList.unshift("All events-All events"); // Then add the all events to it
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
    if (groupBy == "nogrp-showalllines") {
      eventsToList.push(""); 
    } else if (groupBy == "nogrp-showeventonly") {
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
        if (groupBy == "nogrp-showalllines") {
          if (datasetToQuery[i][2].includes(eventsToList)) {
            tempDataSet.push([datasetToQuery[i][0], datasetToQuery[i][1], datasetToQuery[i][2]]);
          }
        } else if (groupBy == "nogrp-showeventonly") {
          var eventLine = ""; // will hold all the events of that line
          for (var event of eventsToList) {
            if (datasetToQuery[i][2].includes(event)) {
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

  // Iterate over each row to find a match based on the keyword, if any
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

function retrieveDataForPaySum(selectedYear, selectedLocation) {
  // Define the needed arrays for output
  var paySumAmount_ByMonth = {};
  hashtag = "#Pay";

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
      let dateValue = mm + "/" + yyyy;
     
      // Get the #Pay line from that cell
      let payLine = importedDataSet[i][2].slice(importedDataSet[i][2].indexOf(hashtag));
      payLine = payLine.slice(0, payLine.indexOf("<br>")); // THIS CAN POSSIBLY BE MERGED WITH THE TOP LINE AT SOME POINT

      // Get the pay amount from that cell
      var paySumTotal = helperGetTotalAmountFromLine(payLine);
     
      // Increment count for that particular mm/yyyy string
      helperPaySumAmount(dateValue, paySumTotal, paySumAmount_ByMonth);
    }
  }

  // Convert the dictionary to an array for consistency (since the dicionary sorting helper function I have converts the dict to an array as well)
  var sumPayAmount_ByMonth = Object.entries(paySumAmount_ByMonth);

  var total = 0;
  for (i = 0; i < sumPayAmount_ByMonth.length; i++) {
    total += sumPayAmount_ByMonth[i][1];
  }
  console.log(total);

  displayPaySumTable(sumPayAmount_ByMonth);
}