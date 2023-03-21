function helperIncrementCount(eventName, countOfOccurances) {
  if (eventName in countOfOccurances) {
    countOfOccurances[eventName] += 1;
  } else {
    countOfOccurances[eventName] = 1;
  }
}
  
function helperCapitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
  // If date2 is in format mm/yyyy then compare the month and year values in each variable
  if (date2.length == 7) { 
    // Get the month and year from each date in order to compare them
    let date1_mm = date1.slice(date1.indexOf(" ")+1, date1.indexOf("/"));
    let date1_yyyy = date1.substring(date1.length - 4);
    let date2_mm = date2.split("/")[0];
    let date2_yyyy = date2.split("/")[1];

    if (date1_mm == date2_mm && date1_yyyy == date2_yyyy) {
      return true;
    } else {
      return false;
    }
  // Otherwise check if the dates are an exact match
  } else {
    if (date1.includes(date2)) {
      return true;
    } else {
      return false;
    }
  }
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

function helperPaySumAmount(dateValue, paySumTotal, paySumAmount_ByMonth) {
  if (dateValue in paySumAmount_ByMonth) {
    paySumAmount_ByMonth[dateValue] += paySumTotal;
  } else {
    paySumAmount_ByMonth[dateValue] = paySumTotal;
  }
}
