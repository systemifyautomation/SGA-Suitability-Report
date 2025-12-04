# Setup Instructions

## Configuration

This Apps Script project requires a template document ID to be configured in Script Properties.

### Setting up Script Properties

1. Open your Apps Script project
2. Click on **Project Settings** (gear icon) in the left sidebar
3. Scroll down to **Script Properties**
4. Click **Add script property**
5. Add the following property:
   - **Property name:** `TEMPLATE_DOCUMENT_ID`
   - **Property value:** `1v-RjpuqNioh4V6EankMXtWE-IG_hhu-prpVrj-H_so8` (or your template document ID)
6. Click **Save script properties**

### Required Services

This project requires the Drive API advanced service:
1. In Apps Script, go to **Services** (+ icon) in the left sidebar
2. Find and add **Drive API**

## Usage

### Creating Documents from HTML

Use the `createDocFromHtml(htmlContent, fileName)` function in `Code.gs` to create new Google Documents from HTML content.

### Add Template Header/Footer (CopyDoc.gs)

Use the `doPost(e)` endpoint in `CopyDoc.gs` to add template header and footer to a document.

**Request:**
```json
{
  "docId": "your_document_id"
}
```

### Replace Document Content with HTML (ReplaceDocContent.gs)

Use the `doPostReplaceContent(e)` endpoint in `ReplaceDocContent.gs` to replace a document's body content with HTML.

**Request:**
```json
{
  "docId": "your_document_id",
  "htmlContent": "<html><body><h1>Hello World</h1></body></html>"
}
```

This endpoint will:
1. Open the document with the specified `docId`
2. Clear the existing body content
3. Replace it with the content converted from the provided HTML

### Response Format

Both endpoints return a JSON response:

**Success:**
```json
{
  "success": true,
  "docId": "your_document_id",
  "url": "https://docs.google.com/document/d/your_document_id/edit?usp=sharing"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```
