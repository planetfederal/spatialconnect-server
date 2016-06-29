FROM        node:latest
MAINTAINER  mcenac@boundlessgeo.com

# Copy web source to web dir
RUN mkdir -p /usr/src/web/dist/
WORKDIR /usr/src/web
COPY web /usr/src/web
RUN npm install --silent
RUN npm install webpack -g --silent
ENV NODE_ENV=development
RUN webpack

# Copy server source to server dir
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
COPY server /usr/src/server

# Install server dependencies
RUN npm install --silent

# Start the service
EXPOSE 8085
CMD ["npm", "start"]
