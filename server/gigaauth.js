const { gigaAuth, giga_scope, giga_model } = require('./config')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const qs = require('qs')

//обход сертификатов нужно, если нету сертификата минцифры
const https = require('https')

const agent = new https.Agent({
    rejectUnauthorized: false
  })

async function fetchToken() {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      RqUID: uuidv4(),
      Authorization: `Basic ${gigaAuth}`,
    },
    data: qs.stringify({
      scope: giga_scope 
    }),
  }

  try {
    const response = await axios(config)
    const data = response.data;
    const accessToken = data.access_token;
    return { accessToken} // нужно передавать при каждом запросе. живет 30 минут
  } catch (error) {
    console.log(error)
  }
}

// запрос к модели токеном
async function giga(content = '', system = '') {
  if (!content) return

  // получаем токен
  const token = await fetchToken()
  const messages = [] // надо для передачи данных в модель, роли и запроса

  if (system) {
    messages.push({ role: 'system', content: system }) // здесь передается контекст типо "ты разработчик" или "суммаризируй текст"
  }

	// формируем данные для обращения
  const data = JSON.stringify({
    model: giga_model,
    messages: messages.concat([
      {
        role: 'user', // здесь передается запрос пользователя
        content,
      },
    ]),
    temperature: 1,  // как пользоваться читай тут https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/post-chat
    top_p: 0.1,
    n: 1,
    stream: false,
    max_tokens: 512,
    repetition_penalty: 1,
    update_interval: 0,
  })

	// настраиваем запрос
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token.accessToken}`,
    },
    data,
  }

	//  запрос возвращая ответ самого чата
  try {
    const response = await axios(config)
    const message = response.data.choices[0].message
    return message.content
  } catch (e) {
    console.log(e)
  }
}

module.exports = { giga }
