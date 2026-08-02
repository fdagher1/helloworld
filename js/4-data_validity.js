// Returns a string confirming if eventCell is properly formatted based on various criteria
function helperValidateEvent(eventCell) {
  // CHECK IF EVENT CELL IS BLANK
  if (eventCell === '') {
    return "The event cell is blank.";
  } 

  // CHECK IF EVENT CELL HAS NO HASHTAGS
  if (!eventCell.includes("#")) {
    return "The event cell does not have any events. It should have at least one.";
  }

  // CHECK IF EVENT CELL HAS ANY BACKSLASHES AS THAT CAN BREAK THE CSV STRUCTURE
  if (eventCell.includes("\\")) {
    return "The event cell contains a backslash character, which is not permitted";
  }

  // CHECK IF EVENT CELL HAS ANY DOUBLE QUOTES AS THAT CAN BREAK THE CSV STRUCTURE
  if (eventCell.includes('"')) {
    return "The event cell contains a double quote character, which is not permitted";
  }

  // CHECK IF THERE ARE EVENT TAGS THAT ARE NOT IN THE DEFAULT EVENT LIST
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
    if (eventName.includes("\n")) { 
      eventName = eventName.slice(0, eventName.indexOf("\n")); // Remove the "\n" from the tag name if it happens to be linked to it. 
    }

    // Check if event name is not in the approved or ignored event lists
    var eventIsAllowed = false;
    for (let j = 0; j < defaultInputValues[5].length; j++) {
      if (eventName == defaultInputValues[5][j].split("_")[1]) {
        eventIsAllowed = true;
        break;
      }
    }
    for (let j = 0; j < defaultInputValues[6].length; j++) {
      if (eventName == defaultInputValues[6][j].split("_")[1]) {
        eventIsAllowed = true;
        break;
      }
    }
    if (eventIsAllowed == false){
      // Since the loop over the event list completed with no breaks, then the event name is missing
      return "The event #" + eventName + " is not a valid event.";
    }
  }

  return "No errors found.";
}

// Returns a string confirming if the thoughts cell is properly formatted based on various criteria
function helperValidateThoughts(thoughtsCell) {
  if (thoughtsCell !== undefined) { // If the thoughts cell is not undefined, that means cell is empty, no need to validate, otherwise code breaks
    // CHECK IF THOUGHTS CELL HAS ANY BACKSLASHES AS THAT CAN BREAK THE CSV STRUCTURE
    if (thoughtsCell.includes("\\")) {
      return "The thoughts cell contains a backslash character, which is not permitted";
    }

    // CHECK IF THOUGHTS CELL HAS ANY DOUBLE QUOTES AS THAT CAN BREAK THE CSV STRUCTURE
    if (thoughtsCell.includes('"')) {
      return "The thoughts cell contains a double quote character, which is not permitted";
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
    
    // VALIDATE THE ROW'S EVENTS
    validationResult = helperValidateEvent(datasetArray[i][2]);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Date: " + datasetArray[i][0];
      break;
    }

    // VALIDATE THE ROW'S THOUGHTS
    validationResult = helperValidateThoughts(datasetArray[i][3]);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Date: " + datasetArray[i][0];
      break;
    }
  }

  console.log(`validateDatasetArray executed in: ${performance.now() - startTime} milliseconds`);
  return validationResult;
}
