import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * Middleware para autenticar requisições via JWT.
 * Anexa o usuário ao objeto req se o token for válido.
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.substring(7); // Remove "Bearer "
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            req.userRole = decoded.role;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao autenticar' });
    }
};

/**
 * Middleware para verificar se o usuário é admin.
 * Deve ser usado APÓS o middleware authenticate.
 */
export const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Admin necessário.' });
    }
    next();
};
