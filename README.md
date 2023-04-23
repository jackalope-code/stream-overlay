# Realtime Networked Image Overlay
Uses React to build a webpage and the npm express package for the API, among other npm dependencies.
## Installation for local testing and development
### Requirements
- Requires Node.js https://nodejs.org/en
- Requires git https://git-scm.com/
- Visual Studio Code or a similar IDE with linting and integrated command line terminals recommended.
- I'm going to Dockerize this at some point but Docker is not required for this to work.
- Something like [Postman](https://www.postman.com/downloads/) can be used to inspect HTTP and WebSocket requests/responses from a GUI.

Clone the repo from the command line:  
```git clone https://github.com/jackalope-code/stream-overlay```  


### Starting the API server for the first time
From the command line:  
1. `cd` into the cloned repo directory (stream-overlay)
2. Go into the server directory  
`cd server`
3. Install dependencies  
`npm install`
4. Start the node server with live reloading on code changes (defaults to http://localhost:4000)  
`npm run dev`

### Starting the webpage for the first time
From the command line:
1. `cd` into the cloned repo directory (stream-overlay)
2. Install dependencies  
`npm install`
3. Start the create-react-app development server with live reloading at http://localhost:3000  
`npm start`

Running `npm run dev` from the server directory and `npm start` from the root stream-overlay directory is enough to start the API server and the webpage respectively, once npm dependencies are installed.

Once the app is deployed, the API will run on a remote server and the webpage interfaces with the API. Users can then access the app from the browser with no dependency requirements.

When the basic functionality is working I'll host a version of the API for awhile. I don't currently have a good way to host the webpage for multiple users. I may be able to get away with hosting the page on GitHub, but I would not be able to create dynamic sessions that way (GitHub only supports static sites).

## Local testing
- Start the development servers for the API and the webpage
- Open two browser windows to the url http://localhost:3000
- Updates to one window should be mirrored to the other window

## Local development
**In the src folder:**  
The entrypoint for the React App webpage is App.tsx. Right now it just contains Overlay.tsx

Overlay.tsx and Widget.tsx are the two primary components for the overlay. Overlay.tsx manages networking and widget data. Widget.tsx sets up event handlers and manages what is displayed for each moveable widget.

Reference for useEffect, useState, and other React hooks
https://react.dev/reference/react

## Issues
- ID's are getting screwed up
  - Adding and updating one item causes an error on the other view. Objects are not getting updated correctly somewhere.
  - Some objects are not generated properly with ID's are are just "ghost objects". Try adding and manipulating multiple items. Item map gets weird w/ state updates.
  - Strange issues with the editor on refresh and component changes (is this still happening?)  
      Something is getting duplicated and not sent back with urls.
- URGENT: Long repeating floats when working with differently scaled values.
- REST and WS unsecured.
- Hosting and env vars all over the place
- No persistance on API restart.
- GUI sucks.
- There's no lock on dragging so there may be unexpected behavior with multiple users dragging.
- Doesn't upsize images... only downsizes
- Websocket shape is not clearly defined or typed.
- Websocket update messages are long and usually don't update much at once.
- Editor GUI should have better asset management and more control over offscreen margins (this should be a server feature to some limit as well with persistance)
- Images could be hosted from anywhere so only allow mods or trusted users until there is better screening. This app is vulnerable to resources changing from the same URL.

## Remaining work
1. Authentication
  - Add and integrate password protection on ALL connections with possibilities for extension to Twitch accounts
2. Find a good approach for always on deployment (Docker + NGINX... split repo into client/api?)
3. Various fixes
  - Add confirm dialogue for overlay resize
  - Truncate numbers on the server side
  - Add form should clear out on submit and have proper validators. Empty shit should not get added from client/server sides
  - Validation and testing on forms and endpoints, w/ proper error handling
  - Set up env vars that work for now for build/dev and revisit later
  - Sanity checks on API/client communication (look for ghost ID bug)
  - Remove log statements
4. Support videos
- CHECKPOINT: Publish, merge, and branch
- Revisit the GUI
- Save/import collections somehow?
- Add server persistance?
  - Redis?
- Revisit build process
  - Build and serve site with VPS NGINX on a Droplet, GitHub Pages, Gatsby, Netlify, etc. Pick one for now.
  - Fix docker environment variables
  - Have better flags for automatic builds
  - Add deployment instructions to README
- Work on testing, security and stability
  - UI and server side validators, secure typing
    - Forms
    - Endpoints
    - WS messages
  - Tests
  - Error messages
    - Connection errors
    - Invalid input errors
    - Missing input errors
- Add session management capabilities if supporting multiple clients from one host.
- Text and text editing
- Merge, republish, and branch here? Aim for backwards compatibility so future updates are more seamless. Future updates to support could include video link and syncing, WS transport changes, SESSIONS, TWITCH AUTH, UI changes, component VISIBILITY CHANGES, networked clear all, grid snapping behavior, etc. Store and persist what is needed.
- Allow linking videos and ensure they play through without restarting constantly 
- Expanded property editing
- Revisit auth with authentication
- Revisit UI state management
- Optimize network changes (use binary for WS and evaluate API architecture)
  - Don't stream so much unnecessary data.. try something delta based?
Requires time sync updates for live playback control
- Networked component controls:
  - Show/hide all
  - Clear all (confirm and have auth)
  - Toggle snap/drag movement
  - Snap to grid?
- Performance logging and revisit site hosting
- Image uploading? More secure to manage from the app, but managing uploads and storage becomes a concern.
- I think an image/resource approval interface would be cool and open up options to engage with more users.
- Stretch features
  - Drawing?
  - Drag to resize?
  - More advanced image editing?
- Other embeds?

## Feature ideas
- Drawing
- Basic image manipulation
- Mod screening interface: approve/reject user-submitted content when allowed or from donos to allow for dono mediashare integration
- Better audio controls
- Advanced embeds

## Troubleshooting
- If objects are not working or nothing is letting you drag it, make sure the server is running and connected properly. Server error statuses would be good to add in the future.

## Environment variables (UNSTABLE)
This should get consolidated somewhat later.
<!-- .env.development.local (published) - Local env vars used in the React app
- REACT_APP_DEV_REST_URL - defaults to http://localhost:4000
- REACT_APP_DEV_WS_URL - defaults to ws://localhost:4000
.env - MUST BE ADDED
- REACT_APP_BUILD_FLAG - set to prod or dev
- REACT_APP_REST_URL set to api server url
- REACT_APP_WS_URL must match -->
Set .env file in project root directory
REACT_APP_WS_ENDPOINT=ws://(server url here)
REACT_APP_REST_ENDPOINT=http://(server url here)
Do not use trailing slashes.

NOTES:
Do not add a trailing slash.
API server port must be 4000 unless EXPOSE is modified in the server Dockerfile.

## How to deploy
TODO
