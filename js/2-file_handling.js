function readContentFromFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  var csvData;
  reader.onload = () => {
      csvData = reader.result; // The CSV data as a string
  };
  reader.readAsText(file);

  setTimeout(() => { 
    datasetArray = helperCsvToArray(csvData);

    // Check if file format is valid 
    var validationResult = validateFileFormatAndData(datasetArray);

    // If so then proceed with displaying the top pane otherwise advise user to look in the browser's console for errors
    if (validationResult == "No errors found.") {
      // Display Data in Top Pane
      retrieveDataForTopPane();

      // Display Data in Table
      retrieveDataForUploadedFile();

      // Clear validity errors if any
      clearFileValidityError();
    } else {
      displayFileValidityError(validationResult);
    }
  }, 1000);
}

function saveContentToFile() {
// GATHER USER INPUT
var enteredDate = document.getElementById("input-date").value; // Read date
var enteredLocation = document.getElementById("input-location").value; // Read Location
var enteredEvents = document.getElementById("input-events").value; // Read events

// CHECK IF OPERATION IS TO UPDATE EXISTING ENTRY OR TO ADD A NEW ONE
var result = helperReturnRowThatMatchesDate(datasetArray, enteredDate)

// CREATE ARRAY FROM INPUT
enteredDate = helperSetDateFormat(enteredDate); // Convert it to format Mon, 12/1/2024
enteredEvents = helperSetBeaklineCharacter(enteredEvents, "backslashnto<br>"); // Replace all \n with <br> as the code currently depends on that
var userInput = [enteredDate, enteredLocation, enteredEvents];

// VALIDATE USER INPUT AND SAVE TO FILE
var validationResult = validateUserInputFormatAndData(datasetArray, userInput, result);
if (validationResult == "No errors found.") {
  // Check if date already exists and if so update the dataset with the new values, otherwise insert line
  if (result == "Date not found.") {
  // Add user input to the dataset
  datasetArray.unshift(userInput); 
  } else {
  datasetArray = helperUpdateRowInDataset(datasetArray, userInput).slice();
  }
  
  // Convert dataset to CSV and add headset
  var datasetCSV = helperArrayToCSV(datasetArray); 
  datasetCSV = "Day,Locations,Events,Thoughts\n" + datasetCSV;
  
  // Clear validity errors in case of any from previous save attemps attemps
  clearFileValidityError();

  // Switch back to read mode
  eventAppModeButtonClicked();

  // Update top pane
  retrieveDataForTopPane();

  // Redisplay the table
  retrieveDataForUploadedFile();
  
  // Download file as plain text
  var file = new Blob([datasetCSV], { type: "text/plain" });
  var a = document.createElement("a");
  var url = URL.createObjectURL(file);
  a.href = url;
  a.download = "helloworld.csv";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  }, 0);

} else {
  displayFileValidityError(validationResult);
}
}