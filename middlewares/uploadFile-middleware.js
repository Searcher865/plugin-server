const ApiError = require('../exceptions/api-error')
const multer = require('multer');

module.exports = function (req, res, next) {
    try {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
              // Укажите путь, куда будут сохраняться файлы
              cb(null, 'uploads/'); // Создаст папку 'uploads' в корне проекта, если она не существует
            },
            filename: (req, file, cb) => {
              // Укажите, как называть сохраненные файлы (например, оригинальное имя файла)
              cb(null, file.originalname);
            },
          });
          
          const upload = multer({ storage: storage });
          
          // Обработка POST-запроса с файлом
          app.post('/upload', upload.single('fileData'), (req, res) => {
            // Файл сохранен, и его данные находятся в req.file
            console.log('Файл сохранен:', req.file);
          
            // Далее можно выполнить другие действия, например, отправить ответ клиенту
            res.send('Файл успешно загружен');
          });

        next()
    } catch(e) {
        return next(ApiError.UnauthorizedError())
    }
}