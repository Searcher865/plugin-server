const bugService = require('../service/bug-service')

// Обработка POST-запроса для создания бага
async function createBug(req, res, next) {
    try {
      const {site, xpath } = req.body;
      const bugData = await bugService.createBug(site, xpath);
      res.json(bugData)
    } catch (error) {
      next(error);
    }
  }
  
  module.exports = {createBug};