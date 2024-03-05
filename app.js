const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 8881;

app.use(express.json());
app.use('/', express.static(path.join(__dirname), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/download', async (req, res) => {
    const { url, audioSpeed } = req.body;
    try {
        const info = await ytdl.getBasicInfo(url);
        const title = info.videoDetails.title;
        const stream = ytdl(url, { quality: 'highestaudio' });

        res.set('Content-Disposition', `attachment; filename="${title}.mp3"`);
        const ffmpegProcess = ffmpeg(stream)
                .audioBitrate(128)
                .audioFilter(`atempo=${audioSpeed}`)
                .format('mp3')
                .outputOptions([
                    '-preset ultrafast',
                    '-movflags faststart'
                ])
                .pipe(res)
                .on('finish', () => {
                    console.log('Файл успешно отправлен пользователю');
                });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Произошла ошибка при обработке запроса');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

process.on('uncaughtException', function (err) {
    console.error(err);
});