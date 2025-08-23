# Étape 1 : Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (plus rapide avec npm ci si lockfile présent)
RUN npm ci

# Copier le reste du code
COPY . .

# Build de l'app React avec Vite
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Supprimer config par défaut
RUN rm -rf /etc/nginx/conf.d/*

# Ajouter une config custom pour React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers générés vers nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer nginx
CMD ["nginx", "-g", "daemon off;"]
