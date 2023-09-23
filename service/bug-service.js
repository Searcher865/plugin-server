const BugModel = require("../models/bug-model")
const DomainModel = require("../models/domain-model")
const PageModel = require("../models/page-model")

class BugService {
    async createBug(url, xpath) {
        const {domain, path} = await this.getDomainAndPath(url)
        const domainId = await this.getDomainId(domain)
        const pathId = await this.getPageId(path, domainId)
        const bugNumber = await this.getBugNumber(domainId, pathId, xpath, "YRNSJDSAK")
        return {bugNumber}
    }

    async getDomainAndPath(url) {

        if (!url || url.trim() === "") {
            throw new Error("URL is empty or null");
          }
        // Проверяем, начинается ли URL с протокола
        if (url.startsWith('http://')) {
          url = url.slice('http://'.length);
        } else if (url.startsWith('https://')) {
          url = url.slice('https://'.length);
        }
      
        // Разбиваем URL по слешу (/) и удаляем пустые части
        const parts = url.split('/').filter(part => part !== '');
      
        // Основной домен - первая часть
        const domain = parts.shift();
        // Путь после домена - остальные части объединяем слешами
        const path = parts.join('/');

        return {domain, path: path};
      }

    async getDomainId(domain) {
    try {
        // Попытка найти сайт в базе данных
        const existingDomain = await DomainModel.findOne({ name: domain });

        if (existingDomain) {
        // Если сайт найден, возвращаем его _id
        return existingDomain._id;
        } else {
        // Если сайт не найден, добавляем его в базу данных
        const savedDomain = await DomainModel.create({name: domain})

        // Возвращаем _id нового сайта
        return savedDomain._id;
        }
    } catch (error) {
        // Обработка ошибок, например, если не удается подключиться к базе данных
        console.error('Ошибка:', error);
        throw error;
    }
    }
      
    async getPageId(path, domainId) {
        try {        
        // Поиск страницы с заданным именем (path) и siteId
        const page = await PageModel.findOne({ path, domainId });

        if (page) {
            // Если страница существует, возвращаем её _id
            return page._id;
        } else {
            // Если страница не существует, создаём новую запись
            const savedPage = await PageModel.create({ path, domainId})

            // Возвращаем _id новой страницы
            return savedPage._id;
        }
        } catch (error) {
        // Обработка ошибок, например, если не удается подключиться к базе данных или почему-то не нашли домен
        console.error('Ошибка:', error);
        throw error;
        }
    }

    async getBugNumber(domainId, pathId, xpath, cardNumber) {
        try {
            // Определяем начальное значение bugNumber
            let bugNumber = 1;

            // Находим запись с наибольшим значением bugNumber для заданного domainId
            const maxBug = await BugModel.findOne({ domainId }).sort({ bugNumber: -1 });
      
            // Если есть запись с наибольшим значением bugNumber, инкрементируем его
            if (maxBug) {
            bugNumber = maxBug.bugNumber + 1;
            }

            // const newBug = await PageModel.create({domainId, pathId, xpath, bugNumber, cardNumber})
                // Создаем новую запись бага
            const newBug = new BugModel({
                domainId,
                pathId, // Возможно, вам нужно заменить это поле на правильное
                xpath,
                bugNumber,
                cardNumber
            });
        
            // Сохраняем новую запись
            await newBug.save()
        
            return bugNumber;
            } catch (error) {
                console.error("Ошибка:", error);
                throw error;
            }
      }
}

module.exports = new BugService()