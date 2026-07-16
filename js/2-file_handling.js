async function readFileAndDisplay(event) {
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
  datasetArray.shift(); //Remove the very first row as it only has the table headers

  // Append any missing dates to dataset
  retrieveDefaultInputValues();
  let missingDates = helperGetDatesBetweenGivenDateAndToday(datasetArray[0][0]); // Get the missing dates between the last date in the dataset and today
  for (date of missingDates) {
    datasetArray.unshift([date, defaultInputValues[1], defaultInputValues[3], ""]); // Add the missing dates to the top of the dataset array
  }

  // Set data in this array as it's the one used for the display
  datasetArrayForDisplay = datasetArray.slice(); 

  // Display Data in Top Pane
  retrieveDataForTopPane();

  // Retrieve date from top pane
  retrieveDataFromTopPane();

  // Display Data in Table
  retrieveDataForListView();

  // Clear old validity errors if any
  clearErrorMessages();

}

async function validateThenSaveContentToFile() {
  // GATHER USER INPUT AND CREATE CORRESPONDING ARRAY
  // Gather user input
  var enteredPassword = document.getElementById("textbox-password").value; // Get user entered password, if any

  // CHECK FILE VALIDITY
  validationResult = validateDatasetArray();

  if (validationResult == "No errors found.") { 
    // CREATE FILE CONTENT
    var datasetCSV = helperArrayToCSV(datasetArray); // Convert dataset to CSV 
    datasetCSV = "Day,Locations,Events,Thoughts\n" + datasetCSV; // Add header to CSV
    datasetArrayForDisplay = datasetArray.slice(); // Update the output dataset array
    
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
    clearErrorMessages(); // Clear error messages in case of any from previous save attemps attemps
    retrieveDataForTopPane(); // Update top pane
    retrieveDataForListView();  // Redisplay the table 

    // Refresh the output display after saving the new event
    document.getElementById("select-displayoption").value = "List: Events & Thoughts";
    eventFilterOrDisplayOptionChanged('displayOption'); 

  } else {
    displayFileValidityError(validationResult);
  }
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
