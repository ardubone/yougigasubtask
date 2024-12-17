const yougile = require('yougile');

async function sendMessage(idFrom, gigaResponseTitle) {
    await yougile.Api.post(`/chats/${idFrom}/messages`, {
      text: `Подзадача создана ${gigaResponseTitle}`,
      textHtml: `Подзадача создана ${gigaResponseTitle}`,
      label: `${gigaResponseTitle}`
    });
  };

  async function getMessages(idFrom, offset) {
    return await yougile.Api.get(`/chats/${idFrom}/messages?offset=${offset}`);
  }

  async function getPrevMessage(idFrom) {
    const data = await yougile.Api.get(`/chats/${idFrom}/messages?offset=-2`);
    const messages = data?.content || [];
    const text = messages.slice(0, -1).map(message => message.text); //сделано, чтобы отсекать последний запрос 
    return text.join(' ');
  }

  async function makeSubtask(originIdTask, newTaskId) {
    try {
      const task = await yougile.Api.get(`/tasks/${originIdTask}`);
      if (!task.subtasks) {
        task.subtasks = [];
      }
      task.subtasks.push(newTaskId);
      await yougile.Api.put(`/tasks/${originIdTask}`, { "subtasks": task.subtasks });
    } catch (error) {
      console.error('Error while making subtask:', error);
    }
  }

async function createSubtask(Title, Description, originIdTask) {
const newTask = await yougile.Api.post(`/tasks`, {
  "title": `${Title}`,
  "description": `${Description}`
  })
  makeSubtask(originIdTask, newTask.id)
}

module.exports = {sendMessage, getMessages, getPrevMessage, createSubtask}