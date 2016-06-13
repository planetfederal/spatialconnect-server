FROM        node:latest
MAINTAINER  mcenac@boundlessgeo.com

# Create directory for app source
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy app source to workdir
COPY package.json .
COPY pong.js .

# Install app dependencies
RUN npm install

# Start the service
EXPOSE 3000
CMD ["npm", "start"]

