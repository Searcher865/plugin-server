const userService = require('../service/user-service')

class Usercontroller {
    async registration(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshTOken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            res.json(userData)
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    async login(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async logout(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async activate(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async refresh(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(['123', '1234'])

        } catch (e) {

        }
    }
}

module.exports = new Usercontroller();