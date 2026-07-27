'use strict';

class TelegramApi {
  constructor(token) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.fileBaseUrl = `https://api.telegram.org/file/bot${token}`;
  }

  async call(method, payload = {}) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(`Telegram ${method}: ${data.description || response.statusText}`);
    }
    return data.result;
  }

  getMe() {
    return this.call('getMe');
  }

  getUpdates(offset, timeout = 30) {
    return this.call('getUpdates', {
      offset,
      timeout,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  sendMessage(chatId, text, extra = {}) {
    return this.call('sendMessage', {
      chat_id: chatId,
      text: String(text).slice(0, 4096),
      ...extra,
    });
  }

  answerCallbackQuery(id, text = '') {
    return this.call('answerCallbackQuery', { callback_query_id: id, text });
  }

  async downloadFile(fileId) {
    const file = await this.call('getFile', { file_id: fileId });
    const response = await fetch(`${this.fileBaseUrl}/${file.file_path}`);
    if (!response.ok) throw new Error(`Download do audio: ${response.statusText}`);
    return { file, buffer: Buffer.from(await response.arrayBuffer()) };
  }
}

module.exports = { TelegramApi };
