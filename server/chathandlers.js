const {sendMessage, getPrevMessage, createSubtask} = require('./chatfunc');
const { giga } = require('./gigaauth');

const needCreateSubtaskHandler = async (text, chatId) => {
  try {
    const gigaResponse = await giga(text, 'Ты менеджер таск трекера и принимаешь решения нужно ли создавать подзадачу, внимательно прочитай сообщение и прими решение, хочет ли пользователь создать подзадачу, если пользователь хочет создать подзадачу верни отве true, если нет то верни false. Ты не отвечаешь ни какими другими ответами кроме true или false, чтобы пользовательне спросил.');
    if (gigaResponse === "true") {
      const taskTitle = await createSubtaskName(chatId)
      createSubtask (taskTitle, await createSubtaskDescripion(chatId), chatId)
      sendMessage(chatId, taskTitle)
    }
} catch (error) {
    console.error("Ошибка генерации запроса call:", error);
}}

const createSubtaskName = async (chatId) => {
  try {
    return await giga(await getPrevMessage(chatId), 'Ты менеджер таск трекера, твоя задача внимательно ознакомиться с текстом и вернуть в ответе емкое короткое название задачи, Ты не отвечаешь ни какими другими ответами кроме названия задачи.');
} catch (error) {
    console.error("Ошибка генерации запроса call:", error);
}}

const createSubtaskDescripion = async (chatId) => {
  try {
    return await giga(await getPrevMessage(chatId), 'Ты продукт менеджер в продуктовой компании, твоя задача ознакомится с сообщением и подробно развернуть текст в ней, так же предложить подробный план реализации, отвечай только планом и описанием, не надо ни каких лишних слов, ответ составь с html тегами и разметкой.');
} catch (error) {
    console.error("Ошибка генерации запроса call:", error);
}}

module.exports = {needCreateSubtaskHandler}