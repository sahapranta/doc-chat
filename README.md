# AI Powered Document Chat

### Packages

- LangChain
- hnswlib
- express
- socket.io
- multer
- undici

## API Docs

#### Upload documents
- **URL**

  `/upload`

- **Method**

  `POST`

- **Authentication**

  Requires a valid API user token.

- **Request Headers**

  - `Authorization`: Bearer token

- **Request Body**

  Form Data:
  - `document`: The file to be uploaded

- **Success Response**

  - **Code:** 200 OK
  - **Content Type:** application/json
  - **Body:**
    ```json
    {
        "message": "Uploaded successfully",
        "filename": "example_document.pdf",
        "success": true
    }
    ```

- **Error Response**

  - **Code:** 401 Unauthorized
    - **Content Type:** application/json
    - **Body:**
      ```json
      {
          "error": "Unauthorized",
          "message": "Invalid or missing token"
      }
      ```

  - **Code:** 500 Internal Server Error
    - **Content Type:** application/json
    - **Body:**
      ```json
      {
          "error": "Server Error",
          "message": "Failed to process the upload"
      }
      ```

- **Sample cURL Request**

  ```bash
  curl -X POST "http://your-api-domain.com/upload" \
      -H "Authorization: Bearer YOUR_API_TOKEN" \
      -F "document=@/path/to/your/document.pdf"
    ```


#### Generates a PowerPoint presentation.
_Request_

```bash
curl -X POST "http://localhost:3000/generatePpt" \
	-H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer TOKEN" \
    -d '{"content":[{"type":"title", "title":"some title"}, {"type":"thanks", "title":"Thank you title"}, {"type":"content", "title":"Some title", "content":"some description"}, {"title":"image", "title":"Some title", "content":"some description", "image":"image_url"}]}' \
```

_Response Headers:_

- Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
- Content-Disposition: attachment filename=output.pptx

_Response Body:_

-  (No body is expected for file download endpoints)

_Response Code:_

- 200: Successful generation of the PowerPoint presentation. The presentation file will be attached to the response.


## Socket API Documentation

This document outlines the usage of the WebSocket API endpoints.

### Connection

Establishes a connection with the server.

- **Event:** `connection`
- **Description:** Initializes a socket connection and sets up event listeners.
- **Usage:** Automatically triggered upon establishing a connection.

### bot-reply

Sends a message from the server to the client.

- **Event:** `bot-reply`
- **Description:** Sends a message from the server to the client.
- **Usage:** Used to communicate messages from the server to the client.

### upload-file

Controls the visibility of the file upload UI on the client side.

- **Event:** `upload-file`
- **Description:** Controls the visibility of the file upload UI on the client side.
- **Usage:** Used to show or hide the file upload UI.

### question

Handles user questions and generates bot replies.

- **Event:** `question`
- **Description:** Handles user questions and generates bot replies based on the uploaded document.
- **Usage:** Used to ask questions and receive responses from the bot.

### file-uploaded

Indicates that a file has been successfully uploaded to the server.

- **Event:** `file-uploaded`
- **Description:** Indicates that a file has been successfully uploaded to the server and initiates document processing.
- **Usage:** Used to handle the successful upload of a document.

### update-balance

Updates the user's balance after deducting words from their account.

- **Event:** `update-balance`
- **Description:** Updates the user's balance after deducting words from their account.
- **Usage:** Used to inform the client about the updated balance.

---


## YouTube Socket API Documentation

This document outlines the usage of the YouTube-related WebSocket API endpoints.

### Connection

Establishes a connection with the YouTube namespace.

- **Namespace:** `/youtube`
- **Event:** `connection`
- **Description:** Initializes a socket connection and sets up event listeners for YouTube-related interactions.
- **Usage:** Automatically triggered upon establishing a connection to the `/youtube` namespace.

### bot-reply

Sends a message from the server to the client.

- **Event:** `bot-reply`
- **Description:** Sends a message from the server to the client.
- **Usage:** Used to communicate messages from the server to the client.

### bot-loading

Indicates that the bot is loading or processing.

- **Event:** `bot-loading`
- **Description:** Indicates that the bot is loading or processing.
- **Usage:** Used to show loading indicators on the client side.

### question

Handles user questions and interactions related to YouTube videos.

- **Event:** `question`
- **Description:** Handles user questions and interactions related to YouTube videos.
- **Usage:** Used to ask questions and receive responses from the bot.

### update-balance

Updates the user's balance after deducting words from their account.

- **Event:** `update-balance`
- **Description:** Updates the user's balance after deducting words from their account.
- **Usage:** Used to inform the client about the updated balance.

### Error Handling

Socket events may emit error messages in case of failures or invalid requests. These errors should be handled gracefully by the client.


## Implementation from Client
```js
import { io } from "socket.io-client";

const TOKEN = "AUTHENTICATION_TOKEN";

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN
    }
});
```
