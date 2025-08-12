# Stage 1: Production image
FROM node:18-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache tini && \
    addgroup -S app && \
    adduser -S -G app app && \
    chown -R app:app /usr/src/app
USER app
COPY package*.json ./
RUN npm ci --omit=dev  # Install production dependencies
COPY . .
ENV NODE_ENV=production
ENV PORT=5001
# Add a simple health endpoint to src/app.js
RUN echo "import express from 'express'; const app = express(); app.get('/health', (req, res) => res.status(200).send('OK')); export default app;" >> src/app.js
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {if(r.statusCode !== 200) throw new Error()})"
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/src/app/server.js"]  # Use exec form without "node" to test