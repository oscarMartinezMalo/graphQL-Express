FROM node:12

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]