#!/bin/bash

set -e

if [ "$DEPLOYMENT_ENV" == "local" ]; then
    docker compose -f services/docker-compose.yml down jwt-issuer --remove-orphans
elif [ "$DEPLOYMENT_ENV" == "cloud" ]; then
    echo cloud
else
    echo "DEPLOYMENT_ENV should be local or cloud, not ${DEPLOYMENT_ENV}"
    exit 1
fi