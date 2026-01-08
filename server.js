const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/send-scream', async (req, res) => {
    try {
        // Безопасное чтение данных из настроек Render
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        // Проверяем, есть ли аудио в запросе
        if (!req.body.audioData) {
            return res.status(400).json({ error: 'Нет аудиоданных' });
        }

        // Конвертируем данные в Blob для отправки
        const audioBuffer = Buffer.from(req.body.audioData, 'base64');
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('audio', audioBuffer, { filename: 'scream.ogg', contentType: 'audio/ogg' });
        form.append('caption', '😱 Крик из игры!');

        const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
            method: 'POST',
            body: form
        });

        const result = await tgResponse.json();
        res.json({ success: result.ok });
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер слушает порт ${PORT}`));
