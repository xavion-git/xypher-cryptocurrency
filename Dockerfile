# Step 1: Build
FROM node:22-alpine AS builder

# Setup working directory
WORKDIR /app

# Copy all packages
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build || npx tsc 

# Step 2: Production
FROM node:22-alpine

# Setup working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Create wallet directory
RUN mkdir -p node/wallet

# Expose HTTP and P2P ports
EXPOSE 3001 6001

# Set environment variables (can be overridden)
ENV HTTP_PORT=3001
ENV P2P_PORT=6001
ENV NODE_ENV=production 

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/blocks', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]