const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Sem token' });

    const token = auth.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        req.user = { 
            id_usuario: payload.id_usuario, 
            tipo_usuario: payload.tipo_usuario || payload.tipo
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

module.exports = { authMiddleware };
