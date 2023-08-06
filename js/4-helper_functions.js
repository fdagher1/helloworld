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
