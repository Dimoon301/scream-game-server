const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const app = express();

// 🔽 ВАЖНО: Разрешаем запросы с любого домена (CORS)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешаем запросы отовсюду
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Быстрый ответ на предварительные запросы
    }
    next();
});

app.use(express.json({ limit: '10mb' })); // Для больших аудиофайлов

app.post('/send-scream', async (req, res) => {
    try {
        // Безопасное чтение данных из настроек Render
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({ error: 'Сервер не настроен (нет токена или ID)' });
        }

        // Проверяем, есть ли аудио в запросе
        if (!req.body.audioData) {
            return res.status(400).json({ error: 'Нет аудиоданных' });
        }

        // Конвертируем base64 обратно в Buffer
        const audioBuffer = Buffer.from(req.body.audioData, 'base64');
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('audio', audioBuffer, { 
            filename: 'scream.ogg', 
            contentType: 'audio/ogg' 
        });
        form.append('caption', '😱 Крик из игры!');

        // Отправляем в Telegram
        const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
            method: 'POST',
            body: form
        });

        const result = await tgResponse.json();
        
        if (result.ok) {
            res.json({ success: true });
        } else {
            console.error('Ошибка Telegram:', result);
            res.status(500).json({ error: result.description || 'Ошибка Telegram' });
        }
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер слушает порт ${PORT}`));
