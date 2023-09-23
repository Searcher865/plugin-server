const BugModel = require("../models/bug-model")
const DomainModel = require("../models/domain-model")
const PageModel = require("../models/page-model")
const axios = require('axios');
const FormData = require('form-data');
const ApiError = require('../exceptions/api-error')

class BugService {
    async createBug(url, xpath, summary, description, environment, fileData) {
        const {domain, path} = await this.getDomainAndPath(url)
        const domainId = await this.getDomainId(domain)
        const pathId = await this.getPageId(path, domainId)
        console.log("TEST before  createTaskInTracker" + summary+" "+ description+" "+ environment+" "+fileData);
        const taskId = await this.createTaskInTracker(summary, description, environment, fileData)
        console.log("TEST createBug " + taskId);
        await this.attachFilesToTask(taskId, "filename", fileData)
        const bugNumber = await this.getBugNumber(domainId, pathId, xpath, taskId)
        return {bugNumber}
        
    }

    async getDomainAndPath(url) {
        if (!url || url.trim() === "") {
            throw ApiError.BadRequest(`URL is empty or null`)
          }
        if (url.startsWith('http://')) {
          url = url.slice('http://'.length);
        } else if (url.startsWith('https://')) {
          url = url.slice('https://'.length);
        }
        const parts = url.split('/').filter(part => part !== '');
      
        const domain = parts.shift();
        const path = parts.join('/');

        return {domain, path: path};
      }

    async getDomainId(domain) {
        try {
            const existingDomain = await DomainModel.findOne({ name: domain });

            if (existingDomain) {
            return existingDomain._id;
            } else {
            const savedDomain = await DomainModel.create({name: domain})

            return savedDomain._id;
            }
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
            }
    }
      
    async getPageId(path, domainId) {
        try {        
        const page = await PageModel.findOne({ path, domainId });
        if (page) {
            return page._id;
        } else {
            const savedPage = await PageModel.create({ path, domainId})
            return savedPage._id;
        }
        } catch (error) {
        console.error('Ошибка:', error);
        throw error;
        }
    }

    async getBugNumber(domainId, pathId, xpath, taskId) {
        try {
            let bugNumber = 1;
            const maxBug = await BugModel.findOne({ domainId }).sort({ bugNumber: -1 });
            if (maxBug) {
            bugNumber = maxBug.bugNumber + 1;
            }
            const newBug = new BugModel({
                domainId,
                pathId, // Возможно, вам нужно заменить это поле на правильное
                xpath,
                bugNumber,
                taskId
            });
            await newBug.save()
            return bugNumber;

            } catch (error) {
                console.error("Ошибка:", error);
                throw error;
            }
    }

    async createTaskInTracker(summary, description, environment, fileData) {
        try {
            const requestBody = {
                "summary": summary,
                "description": description,
                "queue": {
                    "id": 1,
                    "key": "TESTFORPLUGIN"
                }
            };
    
            const response = await axios.post('https://api.tracker.yandex.net/v2/issues', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer y0_AgAAAAATFq7WAAqB_QAAAADs6FC29yntavQmQn2V4OoFOqiVNthFKVs',
                    'X-Org-ID': '5971090'
                },
            });
            
            if (response.status === 201) {
                const responseData = response.data;
                if (responseData && responseData.id) {
                    console.log('Задача успешно создана. ID задачи:', responseData.id);
                    return responseData.id;
                } else {
                    throw ApiError.BadRequest('Не удалось получить ID задачи из ответа')
                }
            } else {
                throw ApiError.BadRequest('Ошибка при создании задачи')
            }
        } catch (error) {
            throw ApiError.BadRequest('Произошла ошибка при отправке запроса:')
        }
    }

    async attachFilesToTask(taskId, filename, fileData) {
        try {
            console.log("TEST TEST TEST + " + fileData);
            const form = new FormData();
            
            // Добавляем параметры в форму
            form.append('filename', filename || 'ФР');
            form.append('file_data', fileData);
    
            // Устанавливаем заголовки
            form.headers = {
                'Authorization': 'Bearer y0_AgAAAAATFq7WAAqB_QAAAADs6FC29yntavQmQn2V4OoFOqiVNthFKVs',
                'X-Org-ID': '5971090',
                'Content-Type': 'multipart/form-data',
                ...form.getHeaders(),
            };
    
            // Отправляем POST-запрос
            const response = await axios.post(`https://api.tracker.yandex.net/v2/issues/${taskId}/attachments/`, form, {
                headers: form.headers,
            });
    
            if (response.status === 200) {
                console.log('Файл успешно загружен');
            } else {
                throw ApiError.BadRequest('Ошибка при загрузке файла')
            }
        } catch (error) {
            throw ApiError.BadRequest('Произошла ошибка при отправке файла')
        }
    }
}

module.exports = new BugService()