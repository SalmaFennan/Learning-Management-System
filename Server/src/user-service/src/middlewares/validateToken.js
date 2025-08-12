export const authenticate = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Extraction du token (multi-sources)
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      if (!token) throw new AppError('Authentication required', 401);

      // 2. Vérification JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Vérification des rôles
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new AppError('Insufficient permissions', 403);
      }

      // 4. Injection des données utilisateur
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };

      next();
    } catch (err) {
      // Gestion spécifique des erreurs JWT
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Session expired', 401));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }
      next(err);
    }
  };
};