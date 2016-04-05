FROM        debian:jessie
MAINTAINER  mcenac@boundlessgeo.com

# Change the interpreter to bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Run updates and install deps
RUN apt-get update
RUN apt-get install -y -q curl

# Install nvm with the latest version of node and npm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 5.7.0
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Set up our PATH correctly
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Create directory for app source
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy app source to workdir
COPY web ./web
COPY common ./common
COPY package.json .
COPY server ./server

# Install app dependencies
RUN npm install
RUN cd /usr/src/app/web; npm install

# Start the service
EXPOSE 3000
CMD ["npm", "start"]
