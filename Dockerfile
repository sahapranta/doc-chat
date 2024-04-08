# Use an official Node.js runtime as the base image
FROM node:18.16.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install && yarn cache clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your Node.js app is listening on
EXPOSE 3000
# EXPOSE 443

# Command to start your Node.js app
CMD [ "node", "server.js" ]

#cd /var/www/node-chat
#docker build -t my-node-app .
#docker run -d -p 3001:3000 --name node_chat my-node-app

#rebuild
#docker build -t my-node-app .
#docker stop node_chat
#docker container rm node_chat
#docker run -d -p 3001:3000 --name node_chat my-node-app
#docker run -d --restart=always -p 3001:3000 --name node_chat my-node-app
#docker run -d --restart=unless-stopped -p 3001:3000 --name node_chat my-node-app
#curl "http://localhost:3001/socket.io/?EIO=4&transport=polling"
#netstat -tlpn