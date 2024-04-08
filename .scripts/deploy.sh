#!/bin/bash
set -e

echo "Deployment started ..."

# Pull the latest version of the app from the production branch
git pull origin production

# Build the Docker image and tag it
docker build -t my-node-app .

# Stop the container if it's running
if [ "$(docker ps -q -f name=node_chat)" ]; then
    echo "Stopping existing node_chat container..."
    docker stop node_chat
fi

# Remove the container if it exists
if [ "$(docker ps -aq -f status=exited -f name=node_chat)" ]; then
    echo "Removing existing node_chat container..."
    docker container rm node_chat
fi

# Run the Docker container
docker run -d -p 3001:3000 --name node_chat my-node-app

systemctl restart httpd.service

echo "Deployment finished!"
