FROM node:20-alpine AS base

FROM base AS build

RUN apk add --no-cache gcompat
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
# Remove all files in frontend except for the dist folder
# RUN find . -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Set working directory
WORKDIR /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]