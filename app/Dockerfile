FROM node:14.5.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]

