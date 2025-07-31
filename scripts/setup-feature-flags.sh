#!/bin/bash

# Setup script for feature flags
echo "Setting up feature flags..."

# Check if feature-flags.json already exists
if [ -f "feature-flags.json" ]; then
    echo "feature-flags.json already exists. Skipping setup."
    echo "If you want to reset it, delete the file and run this script again."
else
    # Copy the example file
    if cp feature-flags.example.json feature-flags.json 2>/dev/null; then
        echo "Created feature-flags.json from template"
        echo "You can now edit feature-flags.json to customize your feature flags"
    else
        echo "Error: Could not find feature-flags.example.json or failed to copy"
        echo "Please ensure feature-flags.example.json exists in the current directory"
        exit 1
    fi
fi

echo "Feature flags setup complete!"
echo ""
echo "Available flags:"
echo "  - enableAuthentication: Enable/disable authentication system"
echo ""
echo "Edit feature-flags.json to change these values."
