# Stage 1: Production image
FROM node:18-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache tini && \
    addgroup -S app && \
    adduser -S -G app app && \
    mkdir uploads && \
    chown -R app:app /usr/src/app
USER app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=5002
ENV NODE_OPTIONS=--es-module-specifier-resolution=node
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5002/health', (r) => {if(r.statusCode !== 200) throw new Error()})"
CMD ["node", "/usr/src/app/server.js"]