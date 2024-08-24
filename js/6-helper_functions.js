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

// Converts an Array to a CSV formatted string
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

// Returns the sum of all the numbers found in a string 
function helperReturnSumFromString(inputString) {
  const numbers = inputString.match(/\d+/g); // match(/\d+/g) returns an array containing all the numbers found in the string 
  if (!numbers) return 0;
  return numbers.reduce((sum, num) => sum + Number(num), 0);
}

// Returns the sum of all the D numbers found in a string 
function helperReturnDSumFromString(inputString) {
  const dollarNumbers = inputString.match(/\$\d+(\.\d+)?/g);
  if (!dollarNumbers) return 0;
  const sum = dollarNumbers.reduce((total, dollarValue) => {
      const numericValue = parseFloat(dollarValue.slice(1));
      return total + numericValue;
  }, 0);
  return sum; 
}

// Returns an array containing rows from dataset that match the criteria selectedTime, selectedLocations, selectedEvents,
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

// Returns a row from the dataset with the enteredDate
function helperReturnRowThatMatchesDate(dataset, enteredDate) {
  // Convert date to below format otherwise the new Date(enteredDate) function returns GMT timezone for some reason
  var day = enteredDate.split("-")[2];
  var month = enteredDate.split("-")[1];
  var year = enteredDate.split("-")[0];
  enteredDate =  month + "-" + day + "-" + year;
  
  // Check if date exists already and if so return that row
  for (const row of dataset) {
    if (new Date(row[0].split(",")[1]).toString() == new Date(enteredDate).toString()) {
      return row;
    }
  }
  return "Date not found.";
}

// Returns an array containing rows from dataset that match the criteria searchWord
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

// Returns an array of indices for the location of searchStr in wholeStr 
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

// Return a new datasetArray that has the updated row in it with userInput
function helperUpdateRowInDataset(datasetArray, userInput) {
  // Check if date exists already and if so return that row
  for (var i = 0; i < datasetArray.length; i++) {
    if (datasetArray[i][0] == userInput[0]) {
      datasetArray[i][1] = userInput[1];
      datasetArray[i][2] = userInput[2];
      return datasetArray;
    }
  }
}

// Function that takes a Date input and returns a string in the format of: Mon, 12/1/2024
function helperSetDateFormat(enteredDate) {
  // Convert date to below format otherwise the new Date(enteredDate) function returns GMT timezone for some reason
  var day = enteredDate.split("-")[2];
  var month = enteredDate.split("-")[1];
  var year = enteredDate.split("-")[0];
  enteredDate =  month + "-" + day + "-" + year;
  enteredDate = new Date(enteredDate);
 
  //enteredDate = new Date(enteredDate.getTime(enteredDate) + 5 * 60 * 60 * 1000); // Add 5 hours as for some reason it thinks it's reading GMT even though the date entered doesn't say that
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

// Function replaces all the \n characters with <br> or vice versa
function helperSetBeaklineCharacter(inputString, direction) {
  if (direction == "backslashnto<br>") {
    return inputString.replace(/\n/g, "<br>");
  } else if (direction == "<br>tobackslashn") {
    return inputString.replace(/<br>/g, "\n");
  }
}