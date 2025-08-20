# Stage 1: Production image
FROM node:18-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache tini && \
    addgroup -S app && \
    adduser -S -G app app && \
    chown -R app:app /usr/src/app
USER app
COPY package*.json ./
RUN [ -f package-lock.json ] && echo "package-lock.json exists" || echo "package-lock.json missing"
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=5004
ENV NODE_OPTIONS=--es-module-specifier-resolution=node
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5004/health', (r) => {if(r.statusCode !== 200) throw new Error()})"
CMD ["node", "/usr/src/app/server.js"]