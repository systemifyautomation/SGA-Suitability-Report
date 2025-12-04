/**
 * Exports a Google Document as PDF and saves it in the same folder.
 * 
 * This function takes a Google Doc ID, exports it as a PDF, and saves
 * the PDF in the same Drive folder as the original document.
 * 
 * @param {string} docId - The ID of the Google Document to export
 * @returns {string} The ID of the created PDF file
 * @throws {Error} If docId is not provided or is empty
 * @throws {Error} If the document cannot be accessed
 */
function exportDocToPdf(docId) {
  // Input validation
  if (!docId || typeof docId !== 'string' || docId.trim() === '') {
    throw new Error('docId is required and must be a non-empty string');
  }
  
  try {
    // Get the original document file
    const docFile = DriveApp.getFileById(docId);
    const docName = docFile.getName();
    
    // Use the specified folder for PDFs
    const PDF_FOLDER_ID = '1i8Ri-p-DxLMbyrV7TBRh8tkJ3PhMN-F4';
    const targetFolder = DriveApp.getFolderById(PDF_FOLDER_ID);
    
    // Export the document as PDF
    // Using the export URL with PDF format
    const pdfBlob = docFile.getAs('application/pdf');
    
    // Set the PDF filename (same as doc name with .pdf extension)
    let pdfName = docName;
    if (!pdfName.toLowerCase().endsWith('.pdf')) {
      pdfName = pdfName + '.pdf';
    }
    pdfBlob.setName(pdfName);
    
    // Check if a PDF with the same name already exists in the folder
    const existingFiles = targetFolder.getFilesByName(pdfName);
    while (existingFiles.hasNext()) {
      const existingFile = existingFiles.next();
      // Move existing file to trash to replace it
      existingFile.setTrashed(true);
    }
    
    // Create the PDF file in the target folder
    const pdfFile = targetFolder.createFile(pdfBlob);
    
    // Return the PDF file ID
    return pdfFile.getId();
    
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access')) {
      throw new Error('Cannot access document with ID: ' + docId + '. Please check permissions.');
    }
    throw error;
  }
}

/**
 * Handles POST requests to export a document as PDF.
 * 
 * Expected POST body (JSON):
 * {
 *   "docId": "document_id_to_export"
 * }
 * 
 * @param {Object} e - The event object containing the POST request data
 * @returns {ContentService.TextOutput} JSON response with the PDF file ID or error
 */
function doPost(e) {
  try {
    // Parse the request body
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Extract docId from request
    const docId = requestData.docId;
    
    // Validate docId
    if (!docId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'docId is required in request body'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Call the export function
    const pdfFileId = exportDocToPdf(docId);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      pdfFileId: pdfFileId,
      url: `https://drive.google.com/file/d/${pdfFileId}/view?usp=sharing`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
