# Collaborative Drawing Board

This repo provides a simple real-time drawing board and chat application using Node.js, Express, and Socket.io. Multiple users can draw on the same canvas and chat simultaneously. New visitors see the previous drawings and chat history when they join.

Features:
- Color picker and eraser for the drawing board
- Chat messages synchronized to everyone
- Previous drawings/messages are sent to new participants

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
