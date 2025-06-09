FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install pnpm (redundant with feature, but ensures availability)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set up PNPM_HOME and update PATH for pnpm global installs
ENV PNPM_HOME="/home/node/.pnpm-global"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p /home/node/.pnpm-global && chown -R node:node /home/node/.pnpm-global