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
          if (char === '\r') { // Ignore any \r, present at the end of each cell in the 4th column, as it's not needed
            // Don't do anything
          } else if (char === '�') {
            currentField += "'";
          } else {
            currentField += char;
          }
      }
  }

  return rows;
}

// Highlights occurrences of a keyword in text by wrapping them in a span with keyword-highlight class
function helperHighlightKeyword(text, keyword) {
  if (!keyword || keyword.trim() === '' || keyword.length < 3) { // Only highlight if the keyword has more than 2 characters to avoid over highlighting from short common words
    return text; // Return original text if no keyword provided
  }
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'); // Case-insensitive global search with escaped special characters
  return text.replace(regex, '<span class="keyword-highlight">$1</span>');
}

// Normalizes editable cell content so line breaks entered in contenteditable divs are preserved
function helperNormalizeEditableCellValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  if (typeof document !== "undefined" && /<[^>]+>/.test(text)) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = text;
    text = tempContainer.innerText || tempContainer.textContent || "";
  }

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

// Converts an Array to a CSV formatted string
function helperArrayToCSV(datasetArray) {
  var datasetCSV = "";
  for (const row of datasetArray) {
    for (const rowNumber in row) {
      if (rowNumber != row.length - 1) {
        datasetCSV += "\"" + row[rowNumber] + "\"" + ",";
      } else {
        datasetCSV += "\"" + row[rowNumber] + "\"";
      }
    }
    datasetCSV += "\n";
  }
  datasetCSV = datasetCSV.substring(0, datasetCSV.length - 1); // Remove the last command breakline
  datasetCSV = datasetCSV + "\n"; // Add a breakline to match the current file structure
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

// Function that calculates the average value for the current month based on the eventLine value and existing average
function helperAverageValue(eventLine, totalCountThisMonth, averageThisMonth){
  var valueToday = parseInt((eventLine.split(" ")[1]));
  if (valueToday) {
    var average = ((averageThisMonth * totalCountThisMonth) + (valueToday * 1)) / (totalCountThisMonth + 1);
    return average.toFixed(2);
  } else {
    return averageThisMonth; // If the value is not a number, return the previous average
  }
}

// Function that returns all the dates between a given date and today's date in the format "ddd, mm/dd/yyyy"
function helperGetDatesBetweenGivenDateAndToday(givenDate) {
  const today = new Date();
  const startDate = new Date(givenDate);

  if (isNaN(startDate.getTime())) {
    return [];
  }

  const dates = [];
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= today) {
    const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "short" });
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const year = currentDate.getFullYear();
    dates.push(`${dayOfWeek}, ${month}/${day}/${year}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
