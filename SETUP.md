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

### Create Document from HTML

Use the `createDocFromHtml(htmlContent, fileName)` function to create Google Documents from HTML content.

### POST Endpoint

The project exposes a `doPost` endpoint that handles multiple actions via POST requests.

#### Copy Document (Add Header/Footer)

Adds template header and footer to an existing document.

**Request:**
```json
{
  "action": "copyDoc",
  "docId": "your_google_document_id"
}
```

**Response:**
```json
{
  "success": true,
  "docId": "your_google_document_id",
  "url": "https://docs.google.com/document/d/{docId}/edit?usp=sharing"
}
```

#### Export to PDF

Exports a Google Document as PDF and saves it in the same Drive folder as the original document. If a PDF with the same name already exists, it will be replaced.

**Request:**
```json
{
  "action": "exportPdf",
  "docId": "your_google_document_id"
}
```

**Response:**
```json
{
  "success": true,
  "pdfId": "pdf_file_id",
  "url": "https://drive.google.com/file/d/{pdfId}/view?usp=sharing"
}
```

**Note:** If `action` is not specified, it defaults to `"copyDoc"` for backward compatibility.
