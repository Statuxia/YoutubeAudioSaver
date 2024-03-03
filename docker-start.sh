#!/bin/bash
DOCKER_IMAGE="youtubeaudiosaver"

echo "Check for builded image"
if ! docker images "$DOCKER_IMAGE" | grep -q "$DOCKER_IMAGE"; then
    echo "$DOCKER_IMAGE not found. building"
    docker build -t youtubeaudiosaver:1.1.1 .
fi

echo "Starting docker-compose"
docker-compose up
