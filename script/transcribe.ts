import fs from 'fs';
import { google } from 'googleapis';
import ytdl from 'ytdl-core';
import FormData from 'form-data';
import { Configuration, OpenAIApi } from 'openai';

type Caption = {
  text: string;
  start: number;
  duration: number;
};

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// https://www.youtube.com/watch?v=dQw4w9WgXcQ

const videoId = 'dQw4w9WgXcQ';
const url = `https://www.youtube.com/watch?v=${videoId}`;

const main = async () => {
  try {
    // const captions = (await getSubtitles({
    //   videoID: videoId,
    // })) as Caption[];

    // console.log('captions ', captions)

    let info = await ytdl.getInfo(videoId);
    let audioFormat = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio' });
    // console.log('info ', audioFormat);
    // const audioStream = ytdl(url, { format: audioFormat }).pipe(
    //   fs.createWriteStream(`${videoId}.${audioFormat.container}`)
    // );

    // // check the file size is not 0 and less than 25 mb
    // const stats = fs.statSync(`${videoId}.${audioFormat.container}`);
    // const fileSizeInBytes = stats.size;
    // const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    // console.log('fileSizeInMegabytes ', fileSizeInMegabytes);
    // if (fileSizeInMegabytes > 25) {
    //   throw new Error('File size is too large');
    // }


    // const filePath = fs.realpathSync(`${videoId}.${audioFormat.container}`);
    // const file = fs.createReadStream(filePath);

    const file = fs.createReadStream(`${videoId}.${audioFormat.container}`);
    const model = 'whisper-1';
    const format = 'verbose_json';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('format', format);

    const prompt = JSON.stringify([
      {
        start: 0,
        text: '[Music]',
      },
      {
        start: 0.12,
        text: 'This is a full sentence',
      },
      {
        start: 0.75,
        text: "We're no strangers to love",
      },
    ]);

    // @ts-ignore
    const resp = await openai.createTranscription(file, 'whisper-1', prompt, 'verbose_json');

    // const res = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    //   headers: {
    //     ContentType: "multipart/form-data",
    //     Authorization: `Bearer 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`,
    //   },
    // });

    const resFile = fs.writeFileSync('res.json', JSON.stringify(resp.data, null, 2));

    console.log('res ... ', resp.data);
  } catch (error) {
    console.log(error.message);
  }
};

main();
