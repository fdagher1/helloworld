// Checks if eventName is already present as a key countOfOccurances dictionary, and if so, it increments its value, otherwise it creates one with value 1
function helperIncrementCount(eventName, countOfOccurances) {
  if (eventName in countOfOccurances) {
    countOfOccurances[eventName] += 1;
  } else {
    countOfOccurances[eventName] = 1;
  }
}
  
function helperSortDictionaryIntoArray(dict) {
  // Create array
  var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  return items;
}
  
function helperCompareDates(date1, date2) {
  if (date2 == "") {
    return true;
  }
  
  // If date2 is in format mm/yyyy then compare the month and year values in each variable
  if (date2.length == 6 || date2.length == 7) { 
    // Get the month and year from each date in order to compare them
    var date1 = new Date(date1);
    var date1_mm = (date1.getMonth()+1).toString();
    var date1_yyyy = date1.getFullYear().toString();
    var date2_mm = date2.split("/")[0];
    var date2_yyyy = date2.split("/")[1];

    // Check if mm/yyyy match and if so return true
    if (date1_mm == date2_mm && date1_yyyy == date2_yyyy) {
      return true;
    }
  // Otherwise check if the dates are an exact match
  } else {
    var date1 = new Date(date1);
    //var date2 = new Date((parseInt(date2)+1).toString()) // Converting the date from yyyy to a full date, had to +1 as for some reason the year value of the date ends up a year older otherwise
    //var date1_mm = (date1.getMonth()+1).toString();
    var date1_yyyy = date1.getFullYear().toString();
    //var date2_mm = (date2.getMonth()+1).toString();
    //var date2_yyyy = date2.getFullYear().toString();

    // Check if yyyy match and if so return true
    if (date1_yyyy == date2) {
      return true;
    }
  }

  return false;

}

function helperGetTotalAmountFromLine(line) {
  var total = 0;
  var stringAmount = "";
  var dollarSignDetected = false;
  var skipDollarCheck = false;
  for (var i = 0; i < line.length; i++) { // iterate over every character and only add when the beginning is a $ sign      
    if (dollarSignDetected) {
      if (line.charAt(i) >= '0' && line.charAt(i) <= "9") {
        stringAmount = stringAmount + line.charAt(i);
        skipDollarCheck = true;
      } else {
        skipDollarCheck = false;
      }
    }
    
    if (!skipDollarCheck) {
      if (line.charAt(i) == "$") {
        dollarSignDetected = true;
      } else {
        dollarSignDetected = false;
        if (stringAmount != "") {
          total += parseInt(stringAmount);
          stringAmount = "";
        }
      }
    }
  }

  return total;
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
              filteredDataSet.push(dataset[i]);
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

// This function returns an erray of indices from wholeStr where the searchStr exists in it 
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
