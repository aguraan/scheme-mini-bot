FROM node:14.5.0-slim

ENV TZ=Europe/Kiev
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]

