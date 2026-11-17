const loginService = require('./login.servicio');

const losLogin = async (req, res) => {
    try {
        const login = await loginService.losLogin(req.body, req);
        return res.json(login);
    } catch (error) {
        console.error('[LOGIN_ERROR]', error.message);
        const esCredencialInvalida = [
            'Usuario no encontrado',
            'Contraseña incorrecta'
        ].includes(error.message);
        const esSolicitudInvalida = error.message === 'Mesa no valida';

        return res.status(esCredencialInvalida ? 401 : esSolicitudInvalida ? 400 : 500).json({
            error: error.message,
            mensaje: error.message
        });
    }
};

module.exports = { losLogin };
