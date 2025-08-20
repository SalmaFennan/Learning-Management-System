// src/middlewares/auth.js
export const isLoggedIn = (req, res, next) => {
  console.log('isLoggedIn middleware executed (local version)');
  // Ajoute ici une logique basique (ex. vérifier un token dans req.headers)
  next(); // Accepte tout pour l'instant
};

export const authorizedRoles = (...roles) => (req, res, next) => {
  console.log('authorizedRoles middleware executed (local version)');
  // Ajoute ici une logique pour vérifier les rôles
  next(); // Accepte tout pour l'instant
};

export const authorizedSubscriber = (req, res, next) => {
  console.log('authorizedSubscriber middleware executed (local version)');
  // Ajoute ici une logique pour les abonnés
  next(); // Accepte tout pour l'instant
};  