#!/bin/bash

# Variables
PREVIOUS_VERSION=`cat version.txt`
tmp=$(mktemp)
DIGITAL_OCEAN_VPS=`printenv DIGITAL_OCEAN_LOOP`

# Prints command above it 
print() {
    echo Running -- $1
    $1
}

# Label
echo "
--------------------------------
        Production build            
--------------------------------
"

# Remove version file
rm version.txt

# Get new version
echo "What should the version be? (Previous version was v$PREVIOUS_VERSION)"
read VERSION

# Write version to version.txt
echo $VERSION >> version.txt

# Update the version in package.json
jq --arg version "$VERSION" '.version=$version' package.json > "$tmp" && mv "$tmp" package.json

# Push to GitHub
git add .
git commit -am $1
git push

# Push to Docker
print "docker build -t herbievine/loop-api:$VERSION ."
print "docker push herbievine/loop-api:$VERSION"

# SSH into VPS and deploy container
ssh -i C:/Users/vineh/OneDrive/Desktop/.keys/ssh root@$DIGITAL_OCEAN_VPS "
    echo Running 'docker pull' &&
    docker pull herbievine/loop-api:$VERSION && 
    echo Running 'docker tag' &&
    docker tag herbievine/loop-api:$VERSION dokku/api:$VERSION && 
    echo Running 'dokku deploy' &&
    dokku deploy api $VERSION
"

# Label
echo "
----------------------------
        Task complete       
----------------------------
"

# Close after 10s
echo Closing in 10 seconds...
sleep 10