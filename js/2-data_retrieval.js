function validateFileFormatAndData(){
  // VALIDATE EACH EVENT CELL
  for (let i = 0; i < importedDataSet.length; i++) { 
    
    // CHECK DATE ORDER
    var latestDateToQuery = new Date(importedDataSet[0][0]); 
    var earliestDateToQuery = new Date(importedDataSet[importedDataSet.length - 1][0]); 
    if (latestDateToQuery < earliestDateToQuery) {
      return "The dates should be ordered in a descending chronological order.";
    }

    // CHECK LOCATION ENTRY VALIDITY
    let rowLocationValueArray = importedDataSet[i][1].split(","); // Get the city and country values in an array
    // Iterate over every city_country that day
    for (let j = 0; j < rowLocationValueArray.length; j++) {
      var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city and country into an array
      if (cityCountrySplitArray.length != 2) {
        return "The location provided in row number " + i + " is missing an underscore";
      }
    }
    
    // CHECK EVENT ENTRY VALIDITY
    var event_cell = importedDataSet[i][2];
    
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
    eventsListedInEventsDropdown = importedDataSet[importedDataSet.length-1][3].split(";"); 
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
        if (eventsListedInEventsDropdown[j].includes("-"+eventName)) {
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
  yearsListedInYearsDropdown.push("All years");
  for (var year = currentYear; year >= 1984; year--) {
    yearsListedInYearsDropdown.push(year);
  }

  // retrieve the locations list
  // Iterate over every row in the table
  for (let i = 0; i < importedDataSet.length; i++) {
    let rowLocationValueArray = importedDataSet[i][1].split(","); // Get the city and country values in an array
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
  countriesListedInLocationDropdown.sort().unshift("All countries");
  citiesListedInLocationDropdown.sort().unshift("All cities");

  // retrieve the events list
  eventsListedInEventsDropdown = importedDataSet[importedDataSet.length-1][3].split(";"); // First populate it from the provided list
  eventsListedInEventsDropdown.unshift("All events-All events"); // Then add the all events to it
  eventsListedInEventsDropdown.pop(); // Remove the last line as it is blank
}

function retrieveDateFromTopPane() {
  selectedYear = document.getElementById("select-date").value;
  selectedLocation = document.getElementById("select-location").value;
  selectedEvent = document.getElementById("select-event").value.split("-")[1]; // Remove the prefix from the event name
  selectedRadioButton;
  if (document.getElementById("radiobutton-groupbylocation").checked) {
    selectedRadioButton = "GroupByLocation";
  } else if (document.getElementById("radiobutton-showeventonly").checked) {
    selectedRadioButton = "ShowEventOnly";
  } else if (document.getElementById("radiobutton-showalllines").checked) {
    selectedRadioButton = "ShowAllLines";
  } else if (document.getElementById("radiobutton-summarisebyeventgroup1").checked) {
    selectedRadioButton = "SummarizeByEventGroup1";
  } else if (document.getElementById("radiobutton-summarisebyeventgroup2").checked) {
    selectedRadioButton = "SummarizeByEventGroup2";
  } else if (document.getElementById("radiobutton-summarisebyeventgroup3").checked) {
    selectedRadioButton = "SummarizeByEventGroup3";
  } else if (document.getElementById("radiobutton-summarisebyeventgroup4").checked) {
    selectedRadioButton = "SummarizeByEventGroup4";
  }
}

function retrieveDataforGroupByLocationTable() {
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

  switch(selectedLocation) {
    case "All countries":
      var queryLocation = countriesListedInLocationDropdown;
      break;

    case "All cities":
      var queryLocation = citiesListedInLocationDropdown;
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

  // Display the group table
  displayDataInTable(columnNames, groupbyDataToDisplay);
}

function retrieveDataforListTable(datasetToQuery, searchWord) {
  // Set the below to blank for ease of querying and for displaying column header
  if (selectedYear.includes("All ")) { 
    selectedYear = ""; 
  }
  if (selectedLocation.includes("All ")) { 
    selectedLocation = ""; 
  } 

  // Define an array for all the event names you want to query for, as they may be 1 or many, or all 
  var eventsToList = [];
  if (selectedEvent.includes("All ")) { 
    // Set it to blank for better layout in the event column title
    selectedEvent = "";
    // All events were selected, and so either display all the lines, or only those with events, depending on what the user chose
    if (selectedRadioButton == "ShowAllLines") {
      eventsToList.push(""); 
    } else if (selectedRadioButton == "ShowEventOnly") {
      // If user chose to show events then build the array to contain all the event names
      for (var event of eventsListedInEventsDropdown) {
        eventsToList.push("#" + event.split("-")[1]);
      }
    }
  } else {
    // Since only one event was selected then put it in the array as a single entry
    eventsToList.push("#" + selectedEvent)
  }

  // Iterate over each row to find a match based on the 3 selected dropdown values
  var tempDataSet = [];
  for (var i = 0; i < datasetToQuery.length; i++) {
    if (helperCompareDates(datasetToQuery[i][0], selectedYear)) {
      if (datasetToQuery[i][1].includes(selectedLocation)) {
        if (selectedRadioButton == "ShowAllLines") {
          if (datasetToQuery[i][2].includes(eventsToList)) {
            tempDataSet.push([datasetToQuery[i][0], datasetToQuery[i][1], datasetToQuery[i][2]]);
          }
        } else if (selectedRadioButton == "ShowEventOnly") {
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

  // Set the content of lastDisplayedDataSet here rather than towards the end, 
  // as it should be done before the textbox content change (otherwise backspace wouldn't do anything)
  lastDisplayedDataSet = tempDataSet.slice(0);

  // Iterate over each row to find a match based on the keyword, if any
  var dataSetToDisplay = [];
  for (const line of tempDataSet) {
    if (line[0].toLowerCase().includes(searchWord.toLowerCase()) || line[1].toLowerCase().includes(searchWord.toLowerCase()) || line[2].toLowerCase().includes(searchWord.toLowerCase())) {
      dataSetToDisplay.push(line);
    }
  }

  // Provide proper column names for table to display data then call function to do so
  // let thirdColumnTitle = selectedYear + ", " + selectedLocation + ", " + selectedEvent;
  let thirdColumnTitle = "";
  var columnNames = ["Date", "Location", thirdColumnTitle];
  displayDataInTable(columnNames, dataSetToDisplay);
}

function retrieveDataforSummaryTable() {
  // Set some variables first  
  var firstRowDate = new Date(importedDataSet[0][0]);
  var lastRowDate = new Date(importedDataSet[importedDataSet.length - 1][0]);
  var latestDateToQuery = firstRowDate; // Assume that "All " was selected but check afterwards and change if needed (less code this way)
  var earliestDateToQuery = lastRowDate; // Assume that "All " was selected but check afterwards and change if needed (less code this way)
  var month_year_arr = [];

  // If selected year is "All" then query all the sheet, otherwise, set the days according to the year selected
  if (selectedYear.includes("All ")) { 
    selectedYear = "";
  } else {
    // Else set the dates for that given year, but not beyond the dates in the sheet
    if (new Date("12/31/" + selectedYear) < firstRowDate) {
      latestDateToQuery = new Date("12/30/" + selectedYear); // Set last date to 12/30 instaed of 12/31 due to bug where December appears twice in month_year_arr (the month minus 1 somehow remains in December)
    }
    
    if (new Date("1/1/" + selectedYear) > lastRowDate) {
      earliestDateToQuery = new Date("1/1/" + selectedYear);
    }
  }

  // Iterate over the datasheet to build the month/year array
  while (new Date(latestDateToQuery.getFullYear(), latestDateToQuery.getMonth()) >= new Date(earliestDateToQuery.getFullYear(), earliestDateToQuery.getMonth())) {
    var month_year = (latestDateToQuery.getMonth()+1).toString() +"/" + latestDateToQuery.getFullYear().toString(); //Adding 1 to month as it starts from 0 rather than 1
    month_year_arr.push(month_year);
    latestDateToQuery.setMonth(latestDateToQuery.getMonth() - 1); // subtract 1 month from the date in order to keep looping
  }

  if (selectedLocation.includes("All ")) { 
    selectedLocation = ""; 
  }

  // Define the items to query
  if (selectedRadioButton == "SummarizeByEventGroup1") {
    var tagsToQuery = ["#Careerevent", "#Lifestylechange", "#Meditate", "#Orgasm", "#Pay", "#Session", "#Smoke"];
  } else if (selectedRadioButton == "SummarizeByEventGroup2") {
    var tagsToQuery = ["#Angry", "#Cry", "#Desire", "#Emotional", "#Happy", "#Healthnote", "#Sad", "Trigger", "Worldevent"];
  } else if (selectedRadioButton == "SummarizeByEventGroup3") {
    var tagsToQuery = ["#Bike", "#Golf", "#Hike", "#Jog", "#Ski", "#Skydive", "#Tennis", "Watersport", "Workout"];
  } else if (selectedRadioButton == "SummarizeByEventGroup4") {
    var tagsToQuery = ["#Date", "#Gathering", "#Hotel", "#Met", "#Restaurant", "#Show", "#Travel", "Visit"];
  }
  
  // Build the dictionary for the count of each tag in each month (dictionary of a dictionaries)
  // Ex: countByMonth["#Workout"]["1/2023"] = 0; 
  var countByMonth = {};
  for (let tagToQuery of tagsToQuery) {
    countByMonth[tagToQuery] = {};
    for (let month_year of month_year_arr) {
      let temp_month_year_dict = {};
      temp_month_year_dict[month_year] = 0;
      countByMonth[tagToQuery] = Object.assign(countByMonth[tagToQuery], temp_month_year_dict);
      // The above is needed as countByMonth[tagToQuery] = {month_year: 0}; results in month_year used as value 
    }
  }

  // Iterate over the datasheet to count the hits for tags
  for (i = 0; i < importedDataSet.length; i++) {
    for (let tagToQuery of tagsToQuery) {
      if (importedDataSet[i][0].includes(selectedYear)){
        if (importedDataSet[i][1].includes(selectedLocation)) {
          if (importedDataSet[i][2].includes(tagToQuery)) {
            // Get the date
            var cell_date = new Date(importedDataSet[i][0]);
            var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
            
            // Increment count in dictionary
            countByMonth[tagToQuery][month_year] += 1
          }
        }
      }
    }
  }

  // Update the column names to include the count in them so they can appear in the table header
  tagsToQuery = []; // Clear old names of array in order to put new names afterwards
  for (let k1 in countByMonth) {
    let totalCount = 0;
    for (let k2 in countByMonth[k1]) {
      totalCount += countByMonth[k1][k2];
    }  
    let new_k1 = k1 + "(" + totalCount.toString() + ")";
    tagsToQuery.push(new_k1);
    countByMonth[new_k1] = countByMonth[k1]; // Rename the dictionary key as well so that the function in data display file can find the values 
    delete countByMonth[k1];
  }

  // Define the items to query
  if (selectedRadioButton == "SummarizeByEventGroup1") {
    
    // Build the dictionary for holding other data from each month, like pay amount, etc.
    var tagsToQueryWithin = ["#Pay"]
    var sumByMonth = {};
    for (let tagToQuery of tagsToQueryWithin) {
      sumByMonth[tagToQuery] = {};
      for (let month_year of month_year_arr) {
        let temp_month_year_dict = {};
        temp_month_year_dict[month_year] = 0;
        sumByMonth[tagToQuery] = Object.assign(sumByMonth[tagToQuery], temp_month_year_dict);
        // The above is needed as sumByMonth[tagsToQueryWithin] = {month_year: 0}; results in month_year used as value 
      }
    }

    // Iterate over the datasheet for other data
    for (i = 0; i < importedDataSet.length; i++) {
      for (let tagToQueryWithin of tagsToQueryWithin) {
        if (importedDataSet[i][0].includes(selectedYear)) {
          if (importedDataSet[i][1].includes(selectedLocation)) {
            switch (tagToQueryWithin) {
              case "#Pay":
                if (importedDataSet[i][2].includes(tagToQueryWithin)) {
                  // Get the #Pay line from that cell
                  let payLine = importedDataSet[i][2].slice(importedDataSet[i][2].indexOf(tagToQueryWithin));
                  payLine = payLine.slice(0, payLine.indexOf("<br>")); // THIS CAN POSSIBLY BE MERGED WITH THE TOP LINE AT SOME POINT

                  // Get the pay amount from that cell
                  var paySumTotal = helperGetTotalAmountFromLine(payLine);

                  // Get the date
                  var cell_date = new Date(importedDataSet[i][0]); // Get corresponding date
                  var month_year = (cell_date.getMonth()+1).toString() +"/" + cell_date.getFullYear().toString();
                  
                  // Add data to dictionary
                  sumByMonth[tagToQueryWithin][month_year] += paySumTotal
                }
                break;

              case "Desire":
                break;
            }
          }
        }
      }
    }

    // Update the column names to include the sum in them so they can appear in the table header
    tagsToQueryWithin = []; // Clear old names of array in order to put new names afterwards
    for (let k1 in sumByMonth) {
      let totalSum = 0;
      for (let k2 in sumByMonth[k1]) {
        totalSum += sumByMonth[k1][k2];
      }  
      let new_k1 = k1 + "($" + totalSum.toString() + ")";
      tagsToQueryWithin.push(new_k1);
      sumByMonth[new_k1] = sumByMonth[k1]; // Rename the dictionary key as well so that the function in data display file can find the values 
      delete sumByMonth[k1];
    }

    // Create the column names for use when displaying the data
    var columnNames = ["Month"].concat(tagsToQuery).concat(tagsToQueryWithin);

  } else {
    // Create the column names for use when displaying the data
    var columnNames = ["Month"].concat(tagsToQuery);
  }

  // Send data to display
  displaySummaryByMonthTable(columnNames, month_year_arr, countByMonth, sumByMonth);
}
