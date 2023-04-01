FROM node:18.3.0

WORKDIR /usr/src/stream-overlay/server

COPY package*.json ./

RUN npm install

COPY . .

# TODO: hardcoded port
EXPOSE 4000

CMD ["npm", "start"]