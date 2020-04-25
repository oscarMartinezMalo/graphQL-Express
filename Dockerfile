FROM node:12

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]

# docker build -t node .
# docker container ls
# docker images
# docker image prune --all
# docker run -p 8080:8080 -d node
# docker container rm 6d119b9cf82e e764fa94bbf7 4c4b9e7cd501
# docker image rm 75835a67d134 -f


# // docker images
# // docker build -t node .
# // docker container ls   
# // docker image prune --all
# // docker container rm 6d119b9cf82e -f
# // docker image rm 6d119b9cf82e -f
# // docker run -p 8080:8080 -d node