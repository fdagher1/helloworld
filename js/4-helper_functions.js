// Parses through a string that has a CSV format, and converts it to a 2D array as follows: Each new line in that string is a new row in the array, and each attribute within the line is a column in the array
function helperCsvToArray(csvString) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      const nextChar = csvString[i + 1];
      if (char === '"' && insideQuotes && nextChar === '"') { // Handle escaped quotes
          currentField += '"';
          i++; // Skip the next quote
      } else if (char === '"') { // Toggle the insideQuotes flag
          insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) { // End of a field
          currentRow.push(currentField);
          currentField = '';
      } else if (char === '\n' && !insideQuotes) { // End of a row
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
      } else { // Regular character
          if (char === '\n') { // Replace any \n, present at the end of each break line within a cell, with <br>, to remain compliant with my other code
            currentField += '<br>';
          } else if (char === '\r') { // Ignore any \r, present at the end of each cell in the 4th column, as it's not needed
            // Don't do anything
          } else if (char === '�') {
            currentField += "'";
          } else {
            currentField += char;
          }
      }
  }

  // Add the last field and row, and remove the very first row as it only has the table headers
  //currentRow.push(currentField);
  //rows.push(currentRow);
  rows.shift();
  return rows;
}

function helperArrayToCSV(datasetArray) {
  var datasetCSV = "";
  for (const row of datasetArray) {
    for (const cell of row) {
      datasetCSV += "\"" + cell + "\"" + ",";
    }
    datasetCSV += "\n";
  }
  datasetCSV = datasetCSV.substring(0, datasetCSV.length - 2); // Remove the last command breakline
  datasetCSV = datasetCSV + "\n"; // Add a breakline to match the current file structure
  datasetCSV = datasetCSV.replace(/<br>/g, "\n"); // Replace all <br> entries with \n instead
  return datasetCSV;
}

// Checks if eventName is already present as a key countOfOccurances dictionary, and if so, it increments its value, otherwise it creates one with value 1
function helperIncrementCount(eventName, countOfOccurances) {
  if (eventName in countOfOccurances) {
    countOfOccurances[eventName] += 1;
  } else {
    countOfOccurances[eventName] = 1;
  }
}

// Function takes in a dictionary, converts it to a 2d array, then sorts the array based on the values in the second column
function helperReturnSortedArrayFromDictionary(dict) {
  // Create array from dictionary
  var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
  });

  // Sort the array based on the second column, which is a count of countries
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  return items;
}

// Function that returns a sum of all the numbers found in a string 
function helperReturnSumFromString(inputString) {
  const numbers = inputString.match(/\d+/g); // match(/\d+/g) returns an array containing all the numbers found in the string 
  if (!numbers) return 0;
  return numbers.reduce((sum, num) => sum + Number(num), 0);
}

// Function that returns a sum of all the D numbers found in a string 
function helperReturnDSumFromString(inputString) {
  const dollarNumbers = inputString.match(/\$\d+(\.\d+)?/g);
  if (!dollarNumbers) return 0;
  const sum = dollarNumbers.reduce((total, dollarValue) => {
      const numericValue = parseFloat(dollarValue.slice(1));
      return total + numericValue;
  }, 0);
  return sum; 
}

// This function returns an array containing rows from dataset that match the criteria selectedTime, selectedLocations, selectedEvents,
function helperReturnRowsThatMatchDropdowns(dataset, selectedTime, selectedLocations, selectedEvents) {
  // Loop over the array to find matches
  var filteredDataSet = []; // Array to hold rows that match the chosen criteria in the 3 dropdowns
  for (i = 0; i < dataset.length; i++) {
    var lineAdded = false; // Used to jump out of for loops when match is found
    if (selectedTime.includes(new Date (dataset[i][0]).getFullYear().toString())) { // Check if row date is among the selected dates
      for (const country of selectedLocations ) {
        if (lineAdded == true) {break;} // If this line has already been added, then get out of this location for loop
        if (dataset[i][1].includes(country)) {
          for (const event of selectedEvents) { // Iterate over the selected events to see if any of them match
            if (lineAdded == true) {break;} // If this line has already been added, then get out of this event for loop
            if (dataset[i][2].includes("#" + event)) { // Check if event criteria matches
              filteredDataSet.push([dataset[i][0], dataset[i][1], dataset[i][2]]); // I listed the 3 cells specifically instead of using dataset[i][0] in order to remove the 4th column from the output
              lineAdded = true;
            }
          }
        }
      }
    }
  }
  return filteredDataSet;
}

// This function returns an array containing rows from dataset that match the criteria searchWord
function helperReturnRowsThatMatchSearchWord(dataset, searchWord) { 
  // Now loop over the array to find matches
  var filteredDataSet = []; // Array to hold rows that match the chosen criteria in the 3 dropdowns
  for (const row of dataset) {
    if (row[0].toLowerCase().includes(searchWord.toLowerCase()) || row[1].toLowerCase().includes(searchWord.toLowerCase()) || row[2].toLowerCase().includes(searchWord.toLowerCase())) {
      filteredDataSet.push(row);
    }
  }
  return filteredDataSet;
}

// This function returns an array of indices for the location of searchStr in wholeStr 
function getIndicesOf(searchStr, wholeStr) {
  const searchStrLen = searchStr.length;
  let startIndex = 0;
  let index;
  const indices = [];
  while ((index = wholeStr.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index + searchStrLen);
      startIndex = index + searchStrLen;
  }
  return indices;
}

function helperValidateDate(date1, date2) { 
  date1 = new Date(date1);
  if (date2.toString() !== new Date(date1.setDate((new Date(date1)).getDate() + 1)).toString()) {
    return "The dates are not in descending order.";
  } else {
    return "No errors found.";
  }
}

function helperValidateLocation(locationString) {
  let rowLocationValueArray = locationString.split(","); // Get the city_country values in an array
  for (let j = 0; j < rowLocationValueArray.length; j++) { // Iterate over every city_country that day
    var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city_country into an array
    if (cityCountrySplitArray.length != 2) {
      return "The location provided is missing an underscore.";
    }
  }
  return "No errors found.";
}

function helperValidateEvent(eventCell, datasetArray) {
  // CHECK IF EVENT CELL IS BLANK
  if (eventCell === '') {
    return "The event cell is blank.";
  } 

  // CHECK IF EVENT CELL DOES NOT END WITH A BREAK LINE
  if (eventCell.slice(-4) != "<br>") {
    return "The event cell does not end with a line break.";
  }

  // CHECK IF EVENT CELL HAS NO HASHTAGS
  if (!eventCell.includes("#")) {
    return "The event cell does not have any events. It should have at least one.";
  }

  // CHECK IF THERE ARE EVENT TAGS THAT ARE NOT IN THE EVENT LIST
  var eventsFromExcelFile = datasetArray[datasetArray.length-1][3].split(";"); // Retrieve the events list from the bottom cell
  // Check if there are any tags in the event cell that are missing from the list
  while (eventCell.includes("#")) { // Iterate over all the # entries in the same cell
    let new_eventCell = eventCell.slice(eventCell.indexOf("#")); // Remove anything before the first # in the cell
    eventCell = new_eventCell.slice(new_eventCell.indexOf(" ")); // Place anything after the first space from the tag in a new cell to iterate over once this is done 
    let eventName = new_eventCell.slice(1,new_eventCell.indexOf(" ")); // Get the tag name
    if (eventName.includes(".")) { 
      eventName = eventName.slice(0, eventName.indexOf(".")); // Remove the "." from the tag name if it happens to be linked to it. 
    }
    if (eventName.includes(",")) { 
      eventName = eventName.slice(0, eventName.indexOf(",")); // Remove the "," from the tag name if it happens to be linked to it. 
    }
    // Should we handle other cases than . and , like <br> perhaps?

    // Check if event name is not in the provided event list
    var event_is_in_list = false;
    for (let j = 0; j < eventsFromExcelFile.length; j++) {
      if (eventsFromExcelFile[j].split("_")[1] == eventName) {
        event_is_in_list = true;
        break;
      }
    }
    if (event_is_in_list == false){
      // Since the loop over the event list completed with no breaks, then the event name is missing
      return "The event " + eventName + " is not a valid event.";
    }
  }

  return "No errors found.";
}

function validateFileFormatAndData(datasetArray){
  let startTime = performance.now();
  let validationResult = "No errors found."; 
  var previousCellDate = new Date(datasetArray[0][0]); // Used further down by the validity check code 
  
  // ITERATE OVER EVERY ROW TO INSPECT IT
  for (let i = 0; i < datasetArray.length; i++) { 
    
    // CHECK THAT DATES ARE IN DESCENDING ORDER
    var currentCellDate = new Date(datasetArray[i][0]); 
    if (i == 0){ 
      // Do nothing as that means we're still in the first row and it's too early to check
    } else {
      validationResult = helperValidateDate(currentCellDate.toString(), previousCellDate.toString());
      if (validationResult != "No errors found.") {
        validationResult = validationResult + " Row: " + ++i;
        break;
      }
    }
    previousCellDate = currentCellDate;

    // CHECK THAT LOCATIONS HAVE UNDERSCORES IN THEM
    validationResult = helperValidateLocation(datasetArray[i][1]);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Row: " + ++i;
      break;
    }
    
    // CHECK EVENT ENTRY VALIDITY: 
    // 1- is not blank, 
    // 2- ends with a break line,
    // 3- has at least 1 hashtag, and
    // 4- all its hashtags are in the list
    validationResult = helperValidateEvent(datasetArray[i][2], datasetArray);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Row: " + ++i;
      break;
    }
  }

  console.log(`validateFileFormatAndData executed in: ${performance.now() - startTime} milliseconds`);
  return validationResult;
}

function validateUserInputFormatAndData(datasetArray, userInput) {
  var validationResult = "No errors found.";

  // CHECK THAT THE DATE IS IN INCREMENTAL ORDER
  var latestDateInFile = new Date(datasetArray[0][0]);
  var dateFromUserInput = new Date(userInput[0]);
  validationResult = helperValidateDate(latestDateInFile, dateFromUserInput);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  // CHECK THAT LOCATIONS ALL HAVE UNDERSCORES IN THEM
  var locationFromUserInput = userInput[1];
  validationResult = helperValidateLocation(locationFromUserInput);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  // CHECK THAT EVENT FORMAT IS CORRECT
  var eventsFromUserInput = userInput[2];
  validationResult = helperValidateEvent(eventsFromUserInput, datasetArray);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  return validationResult;
}

// Function that takes a Date input and returns a string in the format of: Mon, 12/1/2024
function helperSetDateFormat(enteredDate) {
  enteredDate = new Date(enteredDate.getTime(enteredDate) + 5 * 60 * 60 * 1000); // Add 5 hours as for some reason it thinks it's reading GMT even though the date entered doesn't say that
  const dayOfWeek = enteredDate.getDay(); // Returns a number (0 to 6)
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  return weekdays[dayOfWeek].slice(0,3) + ", " + formatDate(enteredDate);
}

// Function replace all the \n characters with <br> as the code is currently looking for that instead 
function helperSetBeaklineCharacter(enteredEvents) {
  var newEnteredEvents = "";
  for (let i = 0; i < enteredEvents.length; i++) {
    if (enteredEvents[i] === '\n') {
      newEnteredEvents += "<br>";
    } else {
      newEnteredEvents += enteredEvents[i];
    }
  }
  return newEnteredEvents;
}