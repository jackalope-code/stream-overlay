# Realtime Networked Image Overlay
## Installation for development
- Requires Node.js https://nodejs.org/en
- Requires git https://git-scm.com/
- Visual Studio Code or a similar IDE with linting and integrated terminals recommended

Uses React and the npm express package, among other dependencies

Clone the repo from the command line:  
```git clone https://github.com/jackalope-code/stream-overlay```
### Starting the server
From the command line:  
1. `cd` into the cloned repo server directory (stream-overlay)
2. `cd server`
3. Install dependencies  
`npm install`
4. Start the node server with live reloading on code changes (defaults to http://localhost:4000)  
`npm run dev`

### Starting the webpage
1. `cd` into the cloned repo directory (stream-overlay)
2. Install dependencies  
`npm install`
3. Start the create-react-app development server with live reloading

Running `npm run dev` from the server directory and `npm start` from the root stream-overlay directory is enough to start the API server and the webpage respectively, once npm dependencies are installed.

## Environment variables
TODO