FROM        node:latest
MAINTAINER  mcenac@boundlessgeo.com

# Create directory for app source
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy app source to workdir
COPY package.json .
COPY server.js .
COPY database.json .
COPY config /usr/src/app/config
COPY migrations /usr/src/app/migrations
COPY models /usr/src/app/models
COPY public /usr/src/app/public
COPY routes /usr/src/app/routes

# Install app dependencies
RUN npm install --silent

# Start the service
EXPOSE 8085
CMD ["npm", "start"]
