const UserModel = require("../models/user-model")
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const fullActivationLink = `${process.env.API_URL}/api/activate/${activationLink}`
        console.log("ПЕРЕД СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ  " +activationLink)
        const user = await UserModel.create({email, password: hashPassword, activationLink})
        
        // await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`); //здесь отправка письма через email
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto, fullActivationLink}
    }

    async activate(activationLink) {
        console.log("ПЕРЕД ПОИСКОМ В БД " +activationLink) ;
        const user = await UserModel.findOne({activationLink})
        console.log("ПОСЛЕ ПОИСКА В БД " +user) ;
        if(!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save()
    }

    async login (email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto, fullActivationLink}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token
    }
}

module.exports = new UserService()