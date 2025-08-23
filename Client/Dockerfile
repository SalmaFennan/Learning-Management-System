# Stage 1: Build with Vite
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --verbose

# Copy source code
COPY . .

# Set environment variables for Vite build
ENV NODE_ENV=production

# Build with Vite (creates 'dist' directory, not 'build')
RUN npm run build

# Verify build output
RUN ls -la dist/ && echo "✅ Vite build completed successfully"

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Create custom nginx config for SPA (Single Page Application)
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Handle client-side routing for SPA\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Cache static assets\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control \"public, immutable\";\n\
    }\n\
    \n\
    # Security headers\n\
    add_header X-Frame-Options \"SAMEORIGIN\" always;\n\
    add_header X-XSS-Protection \"1; mode=block\" always;\n\
    add_header X-Content-Type-Options \"nosniff\" always;\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy built files from builder stage (Vite outputs to 'dist', not 'build')
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files are copied correctly
RUN ls -la /usr/share/nginx/html/ && echo "✅ Files copied to nginx"

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]