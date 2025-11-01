#!/bin/bash

# Create a temporary build directory
rm -rf layer-build
mkdir -p layer-build/nodejs

# Copy package files
cp layer/nodejs/package.json layer-build/nodejs/

# Install dependencies in the layer directory
cd layer-build/nodejs
npm install --platform=linux --arch=arm64 --omit=dev

# Create the layer ZIP file
cd ..
zip -r ../layer/sharp-layer.zip *

# Clean up
cd ..
rm -rf layer-build