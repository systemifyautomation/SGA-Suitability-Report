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
 * Handles POST requests to add template header and footer to a document.
 * 
 * Expected POST body (JSON):
 * {
 *   "docId": "source_document_id"
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
    
    // Validate docId
    if (!docId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'docId is required in request body'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Call the function to add header and footer
    const modifiedDocId = copyDocAndCreateNew(docId);
    
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
