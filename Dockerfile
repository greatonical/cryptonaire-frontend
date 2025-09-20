# Use Bun's official lightweight image
FROM oven/bun:1.2 AS base

# Set working directory
WORKDIR /app

# Copy only package files for efficient layer caching
COPY bun.lockb ./
COPY package.json ./

# Install dependencies (honors bun.lockb)
RUN bun install --frozen-lockfile

# Copy the rest of the app source
COPY . .

# Build-time args for all client-visible values
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_RPC_URL
ARG NEXT_PUBLIC_APP_NAME

# Make them visible during the build stage
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE \
    NEXT_PUBLIC_CHAIN_ID=$NEXT_PUBLIC_CHAIN_ID \
    NEXT_PUBLIC_RPC_URL=$NEXT_PUBLIC_RPC_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME 


# Build the Next.js app
RUN bun run build

# Use a lighter production image
FROM oven/bun:1.2-slim AS prod

# Set working directory
WORKDIR /app

# Copy only what's necessary from the builder image
COPY --from=base /app ./

# Set environment variables (optional)
ENV NODE_ENV=production \
    PORT=3000

# Expose the Next.js default port
EXPOSE 3000

# Start the app
CMD ["bun", "start"]