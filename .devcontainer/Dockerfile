FROM mcr.microsoft.com/devcontainers/python:3.11

# Install Node 20 (but not pnpm globally - let corepack handle it)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack (Node.js package manager)
RUN corepack enable
