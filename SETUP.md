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

Once configured, you can use the `createDocFromHtml(htmlContent, fileName)` function to create Google Documents from HTML content.
