#!/bin/bash

print() {
    echo Running -- $1
    $1
}

echo "
--------------------------------
        Production build            
--------------------------------
"

echo What should the version be?
read VERSION

print "docker build -t herbievine/loop-api:$VERSION ."
print "docker push herbievine/loop-api:$VERSION"

ssh -i C:/Users/vineh/OneDrive/Desktop/.keys/ssh root@46.101.32.15 "
    echo Running 'docker pull' &&
    docker pull herbievine/loop-api:$VERSION && 
    echo Running 'docker tag' &&
    docker tag herbievine/loop-api:$VERSION dokku/api:$VERSION && 
    echo Running 'dokku deploy' &&
    dokku deploy api $VERSION
"

echo "
----------------------------
        Task complete       
----------------------------
"

echo Closing in 10 seconds...
sleep 10