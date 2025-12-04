/**
 * Adds header and footer from the template document to an existing Google Doc.
 * 
 * This function opens an existing Google Doc and applies the header and footer
 * from the template document to it, without modifying the body content.
 * 
 * @param {string} sourceDocId - The ID of the source Google Document to modify
 * @returns {string} The ID of the modified document (same as input)
 * @throws {Error} If sourceDocId is not provided or is empty
 * @throws {Error} If the source document cannot be accessed
 */
function copyDocAndCreateNew(sourceDocId) {
  // Input validation
  if (!sourceDocId || typeof sourceDocId !== 'string' || sourceDocId.trim() === '') {
    throw new Error('sourceDocId is required and must be a non-empty string');
  }
  
  // Get template ID from Script Properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const TEMPLATE_ID = scriptProperties.getProperty('TEMPLATE_DOCUMENT_ID');
  
  if (!TEMPLATE_ID) {
    throw new Error('TEMPLATE_DOCUMENT_ID not configured in Script Properties. Please add it in Project Settings > Script Properties.');
  }
  
  try {
    // Open the source document and template
    const sourceDoc = DocumentApp.openById(sourceDocId);
    const templateDoc = DocumentApp.openById(TEMPLATE_ID);
    
    // Get header and footer from template
    const templateHeader = templateDoc.getHeader();
    const templateFooter = templateDoc.getFooter();
    
    // Get or create header and footer in source document
    let sourceHeader = sourceDoc.getHeader();
    let sourceFooter = sourceDoc.getFooter();
    
    if (!sourceHeader) {
      sourceHeader = sourceDoc.addHeader();
    }
    if (!sourceFooter) {
      sourceFooter = sourceDoc.addFooter();
    }
    
    // Clear existing header and footer content
    sourceHeader.clear();
    sourceFooter.clear();
    
    // Copy header content from template
    if (templateHeader) {
      const headerNumChildren = templateHeader.getNumChildren();
      for (let i = 0; i < headerNumChildren; i++) {
        const element = templateHeader.getChild(i).copy();
        const elementType = element.getType();
        
        if (elementType === DocumentApp.ElementType.PARAGRAPH) {
          sourceHeader.appendParagraph(element);
        } else if (elementType === DocumentApp.ElementType.TABLE) {
          sourceHeader.appendTable(element);
        } else if (elementType === DocumentApp.ElementType.LIST_ITEM) {
          sourceHeader.appendListItem(element);
        } else if (elementType === DocumentApp.ElementType.HORIZONTAL_RULE) {
          sourceHeader.appendHorizontalRule();
        } else if (elementType === DocumentApp.ElementType.INLINE_IMAGE) {
          sourceHeader.appendImage(element);
        }
      }
    }
    
    // Copy footer content from template
    if (templateFooter) {
      const footerNumChildren = templateFooter.getNumChildren();
      for (let i = 0; i < footerNumChildren; i++) {
        const element = templateFooter.getChild(i).copy();
        const elementType = element.getType();
        
        if (elementType === DocumentApp.ElementType.PARAGRAPH) {
          sourceFooter.appendParagraph(element);
        } else if (elementType === DocumentApp.ElementType.TABLE) {
          sourceFooter.appendTable(element);
        } else if (elementType === DocumentApp.ElementType.LIST_ITEM) {
          sourceFooter.appendListItem(element);
        } else if (elementType === DocumentApp.ElementType.HORIZONTAL_RULE) {
          sourceFooter.appendHorizontalRule();
        } else if (elementType === DocumentApp.ElementType.INLINE_IMAGE) {
          sourceFooter.appendImage(element);
        }
      }
    }
    
    // Save and close the document
    sourceDoc.saveAndClose();
    
    // Return the document ID
    return sourceDocId;
    
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access')) {
      throw new Error('Cannot access document with ID: ' + sourceDocId + '. Please check permissions.');
    }
    throw error;
  }
}

/**
 * Replaces the body content of an existing Google Doc with HTML content.
 * 
 * This function opens an existing Google Doc, clears its body content,
 * and replaces it with content converted from the provided HTML.
 * 
 * @param {string} docId - The ID of the Google Document to modify
 * @param {string} htmlContent - The HTML content to insert into the document
 * @returns {string} The ID of the modified document
 * @throws {Error} If docId or htmlContent is not provided or is empty
 * @throws {Error} If the document cannot be accessed
 */
function replaceDocContentWithHtml(docId, htmlContent) {
  // Input validation
  if (!docId || typeof docId !== 'string' || docId.trim() === '') {
    throw new Error('docId is required and must be a non-empty string');
  }
  if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim() === '') {
    throw new Error('htmlContent is required and must be a non-empty string');
  }
  
  try {
    // Open the target document
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    
    // Clear existing body content
    body.clear();
    
    // Create a blob from the HTML content
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'content.html');
    
    // Create a temporary Google Doc from HTML using Drive API advanced service
    const tempFileName = 'temp_html_' + new Date().getTime();
    const tempFileResource = {
      name: tempFileName,
      mimeType: 'application/vnd.google-apps.document'
    };
    
    let tempHtmlFile = null;
    
    try {
      // The convert option ensures the HTML blob is converted to Google Docs format
      // This allows the Drive API to parse and render HTML into native Docs elements
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
    
    return docId;
    
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access')) {
      throw new Error('Cannot access document with ID: ' + docId + '. Please check permissions.');
    }
    throw error;
  }
}

/**
 * Handles POST requests to modify a Google Document.
 * 
 * When htmlContent is provided, replaces the document body with the HTML content.
 * When only docId is provided, adds template header and footer to the document.
 * 
 * Expected POST body (JSON):
 * {
 *   "docId": "document_id",
 *   "htmlContent": "<html>...</html>"  // Optional: if provided, replaces document content
 * }
 * 
 * @param {Object} e - The event object containing the POST request data
 * @returns {ContentService.TextOutput} JSON response with the document ID or error
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
    const htmlContent = requestData.htmlContent;
    
    // Validate docId
    if (!docId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'docId is required in request body'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let modifiedDocId;
    
    // If htmlContent is provided, replace document content with HTML
    if (htmlContent) {
      modifiedDocId = replaceDocContentWithHtml(docId, htmlContent);
    } else {
      // Otherwise, add header and footer from template
      modifiedDocId = copyDocAndCreateNew(docId);
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      docId: modifiedDocId,
      url: `https://docs.google.com/document/d/${modifiedDocId}/edit?usp=sharing`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
