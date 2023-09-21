const UserModel = require("../models/user-model")

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 7)
        const user = await UserModel.create({email, hashPassword})
    }
}

module.exports = new UserService()