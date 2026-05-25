// Returns a string confirming if date2 is after date1 by 1 day
function helperValidateDate(date1, date2) { 
  date1 = new Date(date1);
  if (date2.toString() !== new Date(date1.setDate((new Date(date1)).getDate() + 1)).toString()) {
    return "The dates are not in a chronologically descending order.";
  } else {
    return "No errors found.";
  }
}

// Returns a string confirming if locationString is properly formatted: Has an undercore before and after every comma
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

// Returns a string confirming if eventCell is properly formatted based on various criteria
function helperValidateEvent(eventCell, SliceddatasetArray) {
  // CHECK IF EVENT CELL IS BLANK
  if (eventCell === '') {
    return "The event cell is blank.";
  } 

  // CHECK IF EVENT CELL DOES NOT END WITH A BREAK LINE
  if (eventCell.slice(-1) != "\n") {
    return "The event cell does not end with a line break.";
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

  // CHECK IF THERE ARE EVENT TAGS THAT ARE NOT IN THE EVENT LIST
  var eventsFromExcelFile = datasetArray[datasetArray.length-1][2].split(";"); // Retrieve the events list from the bottom cell
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
    // Should we handle other cases than . and , like \n perhaps?

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

// Returns a string confirming if the thoughts cell is properly formatted based on various criteria
function helperValidateThoughts(thoughtsCell, SliceddatasetArray) {
  // CHECK IF THOUGHTS CELL HAS ANY BACKSLASHES AS THAT CAN BREAK THE CSV STRUCTURE
  if (thoughtsCell.includes("\\")) {
    return "The thoughts cell contains a backslash character, which is not permitted";
  }

  // CHECK IF THOUGHTS CELL HAS ANY DOUBLE QUOTES AS THAT CAN BREAK THE CSV STRUCTURE
  if (thoughtsCell.includes('"')) {
    return "The thoughts cell contains a double quote character, which is not permitted";
  }

  return "No errors found.";
}

// Adds the default country to add to all locations that don't have a country suffix
function helperCheckCountrySuffixAndAddIfMissing(locationString) {
  let rowLocationValueArray = locationString.split(","); // Get the city_country values in an array
  for (let j = 0; j < rowLocationValueArray.length; j++) { // Iterate over every city_country that day
    var cityCountrySplitArray = rowLocationValueArray[j].split("_"); // Split city_country into an array
    if (cityCountrySplitArray.length != 2) { // If there's no underscore
      rowLocationValueArray[j] = rowLocationValueArray[j] + defaultInputValues[2]; // defaultInputValues[2] is the default country suffix 
    }
  }
  
  locationString = rowLocationValueArray.toString();
  return locationString;
}

// Validates the file input by calling all the validation helper functions
function validateFileFormatAndData(SliceddatasetArray){
  let startTime = performance.now();
  let validationResult = "No errors found."; 
  var previousCellDate = new Date(SliceddatasetArray[0][0]); // Used further down by the validity check code 
  
  // ITERATE OVER EVERY ROW TO INSPECT IT
  for (let i = 0; i < SliceddatasetArray.length; i++) { 
    
    // CHECK THAT ROW's DATE IS IN DESCENDING ORDER
    var currentCellDate = new Date(SliceddatasetArray[i][0]); 
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

    // CHECK THE ROW'S LOCATIONS VALIDITY
    validationResult = helperValidateLocation(SliceddatasetArray[i][1]);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Row: " + ++i;
      break;
    }
    
    // CHECK THE ROW'S EVENTS VALIDITY
    validationResult = helperValidateEvent(SliceddatasetArray[i][2], SliceddatasetArray);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Row: " + ++i;
      break;
    }

    // CHECK THE ROW'S THOUGHTS VALIDITY
    validationResult = helperValidateThoughts(SliceddatasetArray[i][3], SliceddatasetArray);
    if (validationResult != "No errors found.") {
      validationResult = validationResult + " Row: " + ++i;
      break;
    }
  }

  console.log(`validateFileFormatAndData executed in: ${performance.now() - startTime} milliseconds`);
  return validationResult;
}

// Validates the user input by calling all the validation helper functions
function validateUserInputFormatAndData(datasetArray, userInput, rowMatchForDate) {
  var validationResult = "No errors found.";

  // CHECK THAT THE DATE IS IN INCREMENTAL ORDER BUT ONLY IF IT'S NOT ALREADY THERE
  if (rowMatchForDate == "Date not found.") {
    var latestDateInFile = new Date(datasetArray[0][0]);
    var dateFromUserInput = new Date(userInput[0]);
    validationResult = helperValidateDate(latestDateInFile, dateFromUserInput);
    if (validationResult != "No errors found.") {
      return validationResult;
    }
  }

  // CHECK LOCATIONS CELL FORMAT VALIDITY
  var locationFromUserInput = userInput[1];
  validationResult = helperValidateLocation(locationFromUserInput);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  // CHECK EVENT CELL FORMATVALIDITY
  var eventsFromUserInput = userInput[2];
  validationResult = helperValidateEvent(eventsFromUserInput, datasetArray);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  // CHECK THOUGHTS CELL FORMATVALIDITY
  var thoughtsFromUserInput = userInput[3];
  validationResult = helperValidateThoughts(thoughtsFromUserInput, datasetArray);
  if (validationResult != "No errors found.") {
    return validationResult;
  }

  return validationResult;
}
