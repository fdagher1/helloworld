async function readContentFromFile(event) {
  // GET FILE CONTENT, AND PASSWORD (IF ANY)
  var enteredPassword = document.getElementById("textbox-password").value; // Get user entered password, if any
  const file = event.target.files[0]; 
  if (enteredPassword == "") {
    var reader = await file.text(); // if not expected to be encrypted, then read file as text
    var decryptedCsvData = reader;
  } else {
    var reader = await file.arrayBuffer(); // if expected to be encrypted, then read file as an array buffer
    var decryptedCsvData = await decrypt(reader, enteredPassword); // decrypt file
  }
  datasetArray = helperCsvToArray(decryptedCsvData); // Convert content from string format to array

  // CHECK FILE VALIDITY
  var validationResult = validateFileFormatAndData(datasetArray);

  // IF VALID THEN UPDATE APP, OTHERWISE DISPLAY ERROR
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
  // GATHER USER INPUT AND CREATE CORRESPONDING ARRAY
  var enteredPassword = document.getElementById("textbox-password").value; // Get user entered password, if any
  var enteredDate = document.getElementById("input-date").value; // Read date
  var enteredLocation = document.getElementById("input-location").value; // Read Location
  var enteredEvents = document.getElementById("input-events").value; // Read events
  enteredDate = helperSetDateFormat(enteredDate); // Convert date to format Mon, 12/1/2024
  enteredEvents = helperSetBeaklineCharacter(enteredEvents, "backslashnto<br>"); // Replace all \n with <br> as the code currently depends on that
  var userInput = [enteredDate, enteredLocation, enteredEvents];

  // VALIDATE USER INPUT ARRAY
  var result = helperReturnRowThatMatchesDate(datasetArray, enteredDate) // Check if operation is to insert new line or to update existing line
  var validationResult = validateUserInputFormatAndData(datasetArray, userInput, result);
  if (validationResult != "No errors found.") {
    displayFileValidityError(validationResult);
    return;
  }

  // CREATE FILE CONTENT
  if (result == "Date not found.") {
    datasetArray.unshift(userInput);  // If date alreadt exists, insert user data as a new line
  } else {
    datasetArray = helperUpdateRowInDataset(datasetArray, userInput).slice(); // Otherwise, update existing line
  }
  var datasetCSV = helperArrayToCSV(datasetArray); // Convert dataset to CSV 
  datasetCSV = "Day,Locations,Events,Thoughts\n" + datasetCSV; // Add headset to CSV
  
  // SAVE FILE
  // Set file content type depending on whether it is encrypted or not  
  if (enteredPassword == "") {
    var contentType = "text/plain";
    var encryptedDatasetCSV = datasetCSV;
  } else {
    var contentType = "application/octet-stream";
    var encryptedDatasetCSV = await encrypt(datasetCSV, enteredPassword);
  }
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

  // UPDATE USER INTERFACE
  clearFileValidityError(); // Clear validity errors in case of any from previous save attemps attemps
  eventAppModeButtonClicked(); // Switch back to read mode
  retrieveDataForTopPane(); // Update top pane
  retrieveDataForUploadedFile();  // Redisplay the table 
}

async function decrypt(encryptedCsvData, enteredPassword) { 
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

async function encrypt(datasetCSV, enteredPassword) {
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