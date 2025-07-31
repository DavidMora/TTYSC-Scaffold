#!/bin/bash

# Setup script for feature flags
echo "Setting up feature flags..."

# Check if feature-flags.json already exists
if [ -f "feature-flags.json" ]; then
    echo "feature-flags.json already exists. Skipping setup."
    echo "If you want to reset it, delete the file and run this script again."
else
    # Copy the example file
    cp feature-flags.example.json feature-flags.json
    echo "Created feature-flags.json from template"
    echo "You can now edit feature-flags.json to customize your feature flags"
fi

echo "Feature flags setup complete!"
echo ""
echo "Available flags:"
echo "  - enableAuthentication: Enable/disable authentication system"
echo ""
echo "Edit feature-flags.json to change these values."
