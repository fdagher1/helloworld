// Returns a string confirming if cellValue is properly formatted based on various criteria
function helperValidateEventOrThought(cellValue, cellType) {
  // CHECK IF EVENT CELL IS BLANK
  if (cellValue === '' && cellType == "event") {
    return "The event cell is blank.";
  } 

  // CHECK IF EVENT CELL HAS NO HASHTAGS
  if (!cellValue.includes("#") && cellType == "event") {
    return "The event cell does not have any events. It should have at least one.";
  }

  // CHECK IF CELL HAS ANY BACKSLASHES AS THAT CAN BREAK THE CSV STRUCTURE
  if (cellValue.includes("\\")) {
    return "The " + cellType + " cell contains a backslash character, which is not permitted";
  }

  // CHECK IF CELL HAS ANY DOUBLE QUOTES AS THAT CAN BREAK THE CSV STRUCTURE
  if (cellValue.includes('"')) {
    return "The " + cellType + " cell contains a double quote character, which is not permitted";
  }

  // CHECK IF THERE ARE TAGS THAT ARE NOT IN THE DEFAULT LIST
  // First collect the tag names
  while (cellValue.includes("#")) { // Iterate over all the # entries in the same cell
    let new_cellValue = cellValue.slice(cellValue.indexOf("#")); // Remove anything before the first # in the cell
    cellValue = new_cellValue.slice(new_cellValue.indexOf(" ")); // Place anything after the first space from the tag in a new cell to iterate over once this is done 
    let tagName = new_cellValue.slice(1,new_cellValue.indexOf(" ")); // Get the tag name
    if (tagName.includes(".")) { 
      tagName = tagName.slice(0, tagName.indexOf(".")); // Remove the "." from the tag name if it happens to be linked to it. 
    }
    if (tagName.includes(",")) { 
      tagName = tagName.slice(0, tagName.indexOf(",")); // Remove the "," from the tag name if it happens to be linked to it. 
    }
    if (tagName.includes("\n")) { 
      tagName = tagName.slice(0, tagName.indexOf("\n")); // Remove the "\n" from the tag name if it happens to be linked to it. 
    }

    // Then check if the tag names are not in the approved or ignored event lists
    // First check if we are validating event or thought cell
    let indexToSearchIn;
    if (cellType == "event") { indexToSearchIn = 5;}
    if (cellType == "thought") { indexToSearchIn = 7;}
    // Then check if the tagValue is allow or not
    var tagIsAllowed = false;
    for (let j = 0; j < defaultInputValues[indexToSearchIn].length; j++) {
      if (tagName == defaultInputValues[indexToSearchIn][j].split("_")[1]) {
        tagIsAllowed = true;
        break;
      }
    }
    for (let j = 0; j < defaultInputValues[indexToSearchIn+1].length; j++) {
      if (tagName == defaultInputValues[indexToSearchIn+1][j].split("_")[1]) {
        tagIsAllowed = true;
        break;
      }
    }
    if (tagIsAllowed == false){
      // Since the loop over the event list completed with no breaks, then the event name is missing
      return "The tag #" + tagName + " is not valid";
    }
  }

  return "No errors found.";
}

// Validates the file input by calling all the validation helper functions
function validateDatasetArray() {
  let startTime = performance.now();
  let validationResult = "No errors found."; 
  var previousCellDate = new Date(datasetArray[0][0]); // Used further down by the validity check code 
  
  // Iterate over the rows in the datasetArray for validation, skipping the last line since it contains default values
  for (let i = 0; i < datasetArray.length-1; i++) { 
    
    // VALIDATE ROW DATE (IS IN DESCENDING ORDER)
    var currentCellDate = new Date(datasetArray[i][0]); 
    if (i == 0){ 
      // Do nothing as that means we're still in the first row and it's too early to check
    } else {
      let date1 = new Date(currentCellDate.toString());
      let date2 = previousCellDate.toString()
      if (date2.toString().slice(0, 15) !== new Date(date1.setDate((new Date(date1)).getDate() + 1)).toString().slice(0, 15)) {
        validationResult = "The dates are not in a chronologically descending order.";
      } else {
        validationResult = "No errors found.";
      }
      if (validationResult != "No errors found.") {
        validationResult = validationResult + " Date: " + datasetArray[i][0];
        break;
      }
    }
    previousCellDate = currentCellDate;

    // VALIDATE ROW LOCATION
    let rowLocationValueArray = datasetArray[i][1].split(","); // Get the city_country values in an array
    if (rowLocationValueArray.length == 0) {
      validationResult = "The location cell is blank.";
    } else if (/[\r\n]/.test(datasetArray[i][1])) { 
      validationResult = "The location cell has a break line in it.";
    } else { // Check if any of the city_country values are missing a country suffix, and if so, append the default country suffix to it
      for (let j = 0; j < rowLocationValueArray.length; j++) { // Iterate over every city_country that day
        var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city_country into an array
        if (cityCountrySplitArray.length != 2) { // If country missing, then append the default country suffix to it
          rowLocationValueArray[j] = rowLocationValueArray[j] + "_" + defaultInputValues[4]; 
        }
      }
      // Update the datasetArray with the modified location values
      datasetArray[i][1] = rowLocationValueArray.join(",");

      // Confirm that there are no errors in the location cell after the modification
      validationResult = "No errors found.";
    }
    
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Date: " + datasetArray[i][0];
      break;
    }
    
    // VALIDATE THE ROW'S EVENTS IF NOT BLANK
    if (datasetArray[i][2] != "") {
      validationResult = helperValidateEventOrThought(datasetArray[i][2], "event");
      if (validationResult != "No errors found.") {
        validationResult = validationResult + " Date: " + datasetArray[i][0];
        break;
      }
    } 

    // VALIDATE THE ROW'S THOUGHTS IF NOT BLANK
    if (datasetArray[i][3] != "") {
      validationResult = helperValidateEventOrThought(datasetArray[i][3], "thought");
      if (validationResult != "No errors found.") {
        validationResult = validationResult + " Date: " + datasetArray[i][0];
        break;
      }
    }
  }

  console.log(`validateDatasetArray executed in: ${performance.now() - startTime} milliseconds`);
  return validationResult;
}
