/**
 * Creates a Google Document from HTML content by duplicating a template.
 * 
 * This function requires the Drive API advanced service to be enabled in the Apps Script project.
 * To enable: Extensions > Apps Script > Services > Add Drive API
 * 
 * @param {string} htmlContent - The HTML content to insert into the document
 * @param {string} fileName - The name for the new document
 * @returns {string} The URL of the created document
 * @throws {Error} If htmlContent or fileName is not provided or is empty
 */
function createDocFromHtml(htmlContent, fileName) {
  // Input validation
  if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim() === '') {
    throw new Error('htmlContent is required and must be a non-empty string');
  }
  if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
    throw new Error('fileName is required and must be a non-empty string');
  }
  
  const TEMPLATE_ID = '1v-RjpuqNioh4V6EankMXtWE-IG_hhu-prpVrj-H_so8';
  
  // Duplicate the template document
  const templateFile = DriveApp.getFileById(TEMPLATE_ID);
  const newFile = templateFile.makeCopy(fileName);
  const newFileId = newFile.getId();
  
  // Open the duplicated document and clear its content
  const doc = DocumentApp.openById(newFileId);
  const body = doc.getBody();
  body.clear();
  
  // Create a blob from the HTML content
  const blob = Utilities.newBlob(htmlContent, 'text/html', fileName + '.html');
  
  // Create a temporary Google Doc from HTML using Drive API advanced service
  // This converts HTML to Google Docs format automatically
  const tempFileResource = {
    name: fileName + '_temp_' + new Date().getTime(),
    mimeType: 'application/vnd.google-apps.document'
  };
  
  let tempHtmlFile = null;
  
  try {
    tempHtmlFile = Drive.Files.create(tempFileResource, blob, {
      convert: true
    });
    
    // Get the body content from the temporary document
    const tempDoc = DocumentApp.openById(tempHtmlFile.id);
    const tempBody = tempDoc.getBody();
    
    // Copy content from temp document to the target document
    const numChildren = tempBody.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const element = tempBody.getChild(i).copy();
      const elementType = element.getType();
      
      if (elementType === DocumentApp.ElementType.PARAGRAPH) {
        body.appendParagraph(element);
      } else if (elementType === DocumentApp.ElementType.TABLE) {
        body.appendTable(element);
      } else if (elementType === DocumentApp.ElementType.LIST_ITEM) {
        body.appendListItem(element);
      } else if (elementType === DocumentApp.ElementType.HORIZONTAL_RULE) {
        body.appendHorizontalRule();
      } else if (elementType === DocumentApp.ElementType.PAGE_BREAK) {
        body.appendPageBreak();
      } else if (elementType === DocumentApp.ElementType.INLINE_IMAGE) {
        body.appendImage(element);
      }
    }
    
    // Save and close documents
    tempDoc.saveAndClose();
    doc.saveAndClose();
  } finally {
    // Clean up temporary file
    if (tempHtmlFile && tempHtmlFile.id) {
      try {
        Drive.Files.remove(tempHtmlFile.id);
      } catch (cleanupError) {
        // Log cleanup error but don't throw - main operation may have succeeded
        console.error('Failed to clean up temporary file: ' + cleanupError.message);
      }
    }
  }
  
  // Set public unlisted access with edit permissions
  // 'Anyone with the link can edit'
  newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  
  // Return the document URL
  return doc.getUrl();
}
