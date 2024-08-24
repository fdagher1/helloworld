
async function readContentFromFile(event) {
  // Get user entered password, if any
  var enteredPassword = document.getElementById("textbox-password").value;

  // Get file content
  const file = event.target.files[0];
  if (enteredPassword == "") {
    var reader = await file.text();
  } else {
    var reader = await file.arrayBuffer();
  }

  // If password was entered then decrypt the content of the read file
  if (enteredPassword == "") {
    var decryptedCsvData = reader;
  } else {
    var decryptedCsvData = await decrypt(reader);
  }
  
  // Convert content from string format to array
  datasetArray = helperCsvToArray(decryptedCsvData);

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
}

async function saveContentToFile() {
  // GATHER USER INPUT    
  var enteredPassword = document.getElementById("textbox-password").value; // Get user entered password, if any
  var enteredDate = document.getElementById("input-date").value; // Read date
  var enteredLocation = document.getElementById("input-location").value; // Read Location
  var enteredEvents = document.getElementById("input-events").value; // Read events

  // CHECK IF OPERATION IS TO UPDATE EXISTING ENTRY OR TO ADD A NEW ONE
  var result = helperReturnRowThatMatchesDate(datasetArray, enteredDate)

  // CREATE ARRAY FROM INPUT
  enteredDate = helperSetDateFormat(enteredDate); // Convert it to format Mon, 12/1/2024
  enteredEvents = helperSetBeaklineCharacter(enteredEvents, "backslashnto<br>"); // Replace all \n with <br> as the code currently depends on that
  var userInput = [enteredDate, enteredLocation, enteredEvents];

  // VALIDATE USER INPUT ARRAY
  var validationResult = validateUserInputFormatAndData(datasetArray, userInput, result);
  if (validationResult != "No errors found.") {
    displayFileValidityError(validationResult);
    return;
  }

  // SAVE FILE
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

  // Encrypt data
  var encryptedDatasetCSV = await encrypt(datasetCSV);
  
  // Set file content type depending on whether it is encrypted or not  
  if (enteredPassword == "") {
    var contentType = "text/plain";
  } else {
    var contentType = "application/octet-stream";
  }
  
  /*
  // Save file
  var file = new Blob([encryptedDatasetCSV], { type: contentType });
  var link = document.createElement("a");
  var url = URL.createObjectURL(file);
  link.href = url;
  link.download = "helloworld.csv";
  document.body.appendChild(link);
  link.click();
  setTimeout(function () {
    document.body.removeChild(link); 
    window.URL.revokeObjectURL(url);
  }, 0);
  */

      // Download file as plain text
      var file = new Blob([encryptedDatasetCSV], { type: "text/plain" });
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
}

async function decrypt(encryptedCsvData) {
  // Get password
  var enteredPassword = document.getElementById("textbox-password").value; // Read password
  
  if (enteredPassword == "") {
    return encryptedCsvData;
  } else {
    try {
      // Convert the password to a key using PBKDF2
      const iv = new Uint8Array(12);
      const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(enteredPassword), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
      const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: new Uint8Array(16), iterations: 100000, hash: 'SHA-256',}, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);    
  
      // Decrypt the ciphertext
      const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedCsvData);
      return new TextDecoder().decode(decryptedData);
    } catch (err) {
      displayFileValidityError('Decryption failed:', err.message);
    }
  }
}

async function encrypt(datasetCSV) {
  // Get password
  var enteredPassword = document.getElementById("textbox-password").value; // Read password

  if (enteredPassword == "") {
    return datasetCSV;
  } else {
    try {
      // Convert the password to a key using PBKDF2
      const iv = new Uint8Array(12);
      const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(enteredPassword), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
      const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: new Uint8Array(16), iterations: 100000, hash: 'SHA-256',}, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        
      // Encrypt the plaintext
      const encodedPlaintext = new TextEncoder().encode(datasetCSV);
      return await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedPlaintext);
    } catch (err) {
      displayFileValidityError('Encryption failed:', err.message);
    }
  }
}
