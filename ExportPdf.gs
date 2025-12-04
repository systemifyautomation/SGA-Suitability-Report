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
    
    // Get the parent folder(s) of the document
    const parentFolders = docFile.getParents();
    
    // Use the first parent folder, or root if none exists
    let targetFolder;
    if (parentFolders.hasNext()) {
      targetFolder = parentFolders.next();
    } else {
      targetFolder = DriveApp.getRootFolder();
    }
    
    // Export the document as PDF
    // Using the export URL with PDF format
    const pdfBlob = docFile.getAs('application/pdf');
    
    // Set the PDF filename (same as doc name with .pdf extension)
    // Remove .gdoc extension if present and add .pdf
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
