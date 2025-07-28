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
    for (const rowNumber in row) {
      if (rowNumber != 2) {
        datasetCSV += "\"" + row[rowNumber] + "\"" + ",";
      } else {
        datasetCSV += "\"" + row[rowNumber] + "\"";
      }
    }
    datasetCSV += "\n";
  }
  datasetCSV = datasetCSV.substring(0, datasetCSV.length - 1); // Remove the last command breakline
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

// Returns a row from the dataset with the enteredDate
function helperReturnRowThatMatchesDate(dataset, enteredDate) {
  // Convert date to below format otherwise the new Date(enteredDate) function returns GMT timezone for some reason
  var day = enteredDate.split("-")[2];
  var month = enteredDate.split("-")[1];
  var year = enteredDate.split("-")[0];
  enteredDate =  month + "/" + day + "/" + year;
  
  // Check if date exists already and if so return that row
  for (const row of dataset) {
    if (new Date(row[0].split(",")[1]).toString() == new Date(enteredDate).toString()) {
      return row;
    }
  }
  return "Date not found.";
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
  enteredDate =  month + "/" + day + "/" + year;
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

// Function that returns splits a string on last occurance of a character then returns the string after the split (needed for retrieving state names)
function helperSplitStringLastOccurrence(str, char) {
  const lastIndex = str.lastIndexOf(char);

  if (lastIndex === -1) {
    return [str]; // Character not found, return original string as single element array
  }

  const partBefore = str.substring(0, lastIndex);
  const partAfter = str.substring(lastIndex + 1);

  return partAfter;
} 

// Function that sums the second element in an 2 dimentional array
function helperSumSecondElement(arr) {
  var total = 0;
  for (const row of arr) {
    total += row[1];
  }
  return total;
}

function helperAverageValue(eventLine, totalCountThisMonth, averageThisMonth){
  console.log("Total count this month: " + totalCountThisMonth);
  console.log("Average this month before this new line: " + averageThisMonth);
  console.log("Event line: " + eventLine);
  var valueToday = parseInt((eventLine.split(" ")[1]));
  console.log("The value today: " + valueToday);
  if (valueToday) {
    var average = ((averageThisMonth * totalCountThisMonth) + (valueToday * 1)) / (totalCountThisMonth + 1);
    console.log("The new average is: " + average);
    return average;
  } else {
    console.log("The average did not change: " + averageThisMonth);
    return averageThisMonth; // If the value is not a number, return the previous average
  }
}