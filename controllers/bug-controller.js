const bugService = require('../service/bug-service')


async function createBug(req, res, next) {

    try {
      const {url, xpath, summary, description, environment, fileData} = req.body;
      console.log("TTTTTEEEESSSTTT " + JSON.stringify(req.body));
      // В этой точке req.body уже содержит данные из form-data
      const bugData = await bugService.createBug(url, xpath, summary, description, environment, fileData);
      res.json(bugData);
    } catch (error) {
      next(error);
    }
}
  module.exports = {createBug};