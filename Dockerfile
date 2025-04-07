FROM node:20-slim AS base

FROM base AS build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/google-chrome-stable

# Install Google Chrome
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json tsconfig.json server ./

RUN npm ci && \
  npm run build && \
  npm prune --production

COPY frontend/package*.json frontend/tsconfig.json ./frontend/
RUN cd frontend && npm ci

COPY --link . .

WORKDIR /app/frontend
RUN npm run build

# Final stage for app image
FROM base

# Install Chrome in the final stage
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/google-chrome-stable

# Copy built application
COPY --from=build /app /app

# Set working directory
WORKDIR /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]