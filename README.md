# Collaborative Drawing Board

This repo provides a simple real-time drawing board and chat application using Node.js, Express, and Socket.io. Multiple users can draw on the same canvas and chat simultaneously. New visitors see the previous drawings and chat history when they join.

Features:
- Color picker and medium-sized eraser for the drawing board
- Chat messages synchronized to everyone
- Image uploads via the **IMG** button (local files only)
- Previous drawings/messages are sent to new participants
- Admin `CMD` panel for clearing chat/board and posting announcements
- Single-click dots display properly for all participants
- Server logs include IP addresses for connections and messages

## Running in GitHub Codespaces
1. Open this repository in GitHub Codespaces.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Once running, press the `Ports` tab in Codespaces to expose port `3000` and share the URL with others.

## Manual Usage
If you clone the repository locally, run:
```bash
npm install
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Commands

Click the **CMD** button in the top-right corner and enter password `2292` to open the command panel. Supported commands:

- `clear chat` – remove all chat history for everyone
- `clear board` – wipe the drawing canvas for everyone
- `announce {message} {seconds}` – display a message in the announcements area for the given time in seconds. Use `0` to keep it visible permanently.
