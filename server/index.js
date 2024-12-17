const {needCreateSubtaskHandler} = require('./chathandlers');
const yougile = require('yougile');
const Levenshtein = require('levenshtein');


const isTask = async (chatId) => {
    try {
        const task = await yougile.Api.get(`/tasks/${chatId}`);
        // Проверка на статус код 404
        if (task && task.statusCode === 404) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error fetching task with chatId ${chatId}:`, error);
        return false;
    }
};

const handler = async data => {
    const text = data?.text;
    const chatId = data?.chatId;

    if (await isTask(chatId)) {
        // Функция для проверки расстояния Левенштейна
        const isSimilar = (input, target, maxDistance) => {
            return new Levenshtein(input, target).distance <= maxDistance;
        };

        const keyword = "подзадач";
        const maxDistance = 2; // Максимально допустимое количество ошибок

        if (text) {
            const words = text.split(/\s+/); // Разделяем текст на слова
            for (const word of words) {
                if (isSimilar(word, keyword, maxDistance)) {
                    needCreateSubtaskHandler(text, chatId)
                    return; // Завершаем обработку при первом совпадении
                }
            }
        }
    }
};

// Подписка
yougile.Api.subscribe({ event: 'chat_message-created', handler });

