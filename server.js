import { createServer } from 'http';
import Joi from 'joi'; // сначала нужно установить библиотеку npm install joi

const hostname = '127.0.0.1';
const port = 3000;

// Создаем массив для хранения данных
let posts = [
    {
        id: 1,
        user: 'Alex',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
];

// Определяем ожидаемую структуру данных для POST-запроса.
const postSchema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    user: Joi.string().required(),
    body: Joi.string().required(),
});

// Создаем бэкенд и определяем заголовки
const server = createServer((req, res) => {
    // Устанавливаем заголовки CORS для разрешения кросс-доменных запросов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, DELETE, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Определяем поведение бэкенда при различных запросах

    if (req.method === 'OPTIONS') {
        // Обрабатываем запрос OPTIONS для предварительной проверки CORS
        res.statusCode = 204; // Устанавливаем успешный статус 204 (No Content)
        res.end();
        return;
    }

    if (req.method === 'POST') {
        // Обработка POST-запроса, когда клиент отправляет данные
        let data = '';

        req.on('data', (chunk) => {
            // Получаем данные в виде потоковых чанков
            data += chunk;
        });

        req.on('end', () => {
            try {
                const postData = JSON.parse(data); // Парсим JSON-данные
                const { error, value } = postSchema.validate(postData); // Проверка и валидация данных перед их добавлением в массив posts. Если данные не соответствуют схеме, сервер вернет ошибку с соответствующим статусом и сообщением.

                if (error) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: error.details[0] ? error.details[0].message : 'Данные введены некорректно' }));
                } else {
                    posts.push(value); // Добавляем новые данные в массив
                    console.log('Добавлены новые данные:');
                    console.log(value);
                    res.statusCode = 201; // Устанавливаем успешный статус 201 (создание объекта)
                    res.setHeader('Content-Type', 'application/json'); // Устанавливаем тип контента JSON
                    res.end(JSON.stringify(value)); // Отправляем клиенту добавленные данные
                }

            } catch (error) {
                console.error('При отправке запроса возникла ошибка:', error);
                res.statusCode = 400; // Устанавливаем статус 400 (Bad Request) при ошибке
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Ошибка при отправке данных' }));
            }
        });
    } else if (req.method === 'GET') {
        // Обработка GET-запроса, когда клиент запрашивает данные
        res.statusCode = 200; // Устанавливаем успешный статус 200 (OK)
        res.setHeader('Content-Type', 'application/json'); // Устанавливаем тип контента JSON
        res.end(JSON.stringify(posts)); // Отправляем массив данных клиенту
    } else if (req.method === 'DELETE') {
        // Обработка DELETE-запроса
        const id = req.url.split('/')[1]; // Получаем id из URL (например, /1)
        const index = posts.findIndex(post => post.id === parseInt(id));
        if (index > -1) {
            posts.splice(index, 1); // Удаляем пост из массива
            res.statusCode = 204; // No Content
            res.end();
        } else {
            res.statusCode = 404; // Not Found
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Пост не найден' }));
        }
    } else if (req.method === 'PUT') {
        // Обработка PUT-запроса
        const id = req.url.split('/')[1]; // Получаем id из URL
        let data = '';

        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            try {
                const updatedPost = JSON.parse(data);
                const { error, value } = postSchema.validate(updatedPost);
                if (error) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: error.details[0].message }));
                } else {
                    const index = posts.findIndex(post => post.id === parseInt(id));
                    if (index > -1) {
                        posts[index] = value; // Обновляем пост в массиве
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(value));
                    } else {
                        res.statusCode = 404; // Not Found
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Пост не найден' }));
                    }
                }
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Ошибка при обновлении данных' }));
            }
        });
    } else {
        // Обработка других методов запроса (например, PUT, DELETE и т. д.)
        res.statusCode = 405; // Устанавливаем статус 405 (Method not allowed)
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Требуется POST-запрос или GET-запрос' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`HTTP-бэкенд работает по адресу http://${hostname}:${port}/`);
});
