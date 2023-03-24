# Realtime React Image Overlay

## TODO
### Server
- Finish implementing subscriptions, queries, models and split effectively (subscriptions over ws and the rest over http)
### Client
- Integrate with Apollo and process subscriptions for updates
### Server/Client
- Support image uploading and processing and map this to stored ids in order to load moveable components properly
### Server
- Use redis to sync and persist changes
### General
- Work on the overlay itself and supporting interfaces
- Test functionality
- Bundling, hosting, deployment
### Stretch goals
- Add Twitch auth to server and client with additional admin permissions provided by the app
- Add a confirm screen to allow a superadmin to add new components