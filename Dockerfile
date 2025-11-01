# Multi-stage Dockerfile for Next.js 16 (standalone)
# 1) Install deps and build
FROM node:20-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app

# Install OS deps for prisma if needed
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies (clean install)
RUN npm ci --include=dev

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

# 2) Run minimal image
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy the standalone server, static assets, and public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000
ENV PORT=3000

# Use non-root user
USER nextjs

# Start the Next.js standalone server
CMD ["node", "server.js"]
