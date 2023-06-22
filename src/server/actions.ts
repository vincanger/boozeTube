import HttpError from '@wasp/core/HttpError.js';
import type { ScrapeCaptionsAndSave, GenerateCaptionsAndSave } from '@wasp/actions/types';
import type { Caption } from '@wasp/entities';
import type { CaptionChunk } from '@wasp/shared/types';
//@ts-ignore
import { getSubtitles } from 'youtube-captions-scraper';
import { youtube, openai, ytCategoryIds, countRepeatedWords } from './utils.js';
import fs from 'fs';
import ytdl from 'ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
console.log('directory-name 👉️', __dirname);

type ScrapeArgs = {
  videoId: string;
  transcribeWithLyrics?: boolean;
};

export const scrapeCaptionsAndSave: ScrapeCaptionsAndSave<ScrapeArgs, Caption> = async ({ videoId }, context) => {
  try {
    const info = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });

    if (!info.data.items) throw new HttpError(404, 'Video not found');

    const title = info.data.items[0]?.snippet?.title;
    const thumbnail = info.data.items[0]?.snippet?.thumbnails?.default?.url;
    const channelId = info.data.items[0]?.snippet?.channelId;
    const channelTitle = info.data.items[0]?.snippet?.channelTitle;
    const defaultLanguage = info.data.items[0]?.snippet?.defaultLanguage?.includes('-')
      ? info.data.items[0]?.snippet?.defaultLanguage?.split('-')[0]
      : info.data.items[0]?.snippet?.defaultLanguage;
    const defaultAudioLanguage = info.data.items[0]?.snippet?.defaultAudioLanguage?.includes('-')
      ? info.data.items[0]?.snippet?.defaultAudioLanguage?.split('-')[0]
      : info.data.items[0]?.snippet?.defaultAudioLanguage;

    if (!channelId) throw new HttpError(404, 'Channel not found');

    const captions = (await getSubtitles({
      videoID: videoId,
      lang: defaultLanguage || defaultAudioLanguage || 'en',
    })) as CaptionChunk[];

    if (!captions) throw new HttpError(404, 'Captions not found');

    captions.forEach((caption, idx) => {
      const currentStart = Number(caption.start);
      const nextStart = Number(captions[idx + 1]?.start);
      if (nextStart === undefined) return;
      if (idx === 0) {
        caption.dur = String(nextStart);
      } else if (idx !== captions.length - 1) {
        caption.dur = String(nextStart - currentStart);
      }
    });

    let youTuber = await context.entities.YouTuber.findFirst({
      where: { id: channelId },
    });

    if (!youTuber) {
      youTuber = await context.entities.YouTuber.create({
        data: {
          id: channelId,
          name: channelTitle || ' ',
        },
      });
    }

    return await context.entities.Caption.create({
      data: {
        videoId,
        videoTitle: title || ' ',
        youTuberId: channelId,
        thumbnail: thumbnail,
        captionChunks: JSON.stringify(captions),
      },
    });
  } catch (error: any) {
    console.log('error >>> ', error);
    throw new HttpError(404, error?.message || 'Captions not found');
  }
};

export const generateCaptionsAndSave: GenerateCaptionsAndSave<ScrapeArgs, Caption> = async (
  { videoId, transcribeWithLyrics },
  context
) => {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const vidInfo = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });
    console.log('transcribeWithLyrics??? >>> ', transcribeWithLyrics);
    if (!vidInfo.data.items) throw new HttpError(404, 'Video not found');

    const description = vidInfo.data.items[0]?.snippet?.description;
    const categoryId = vidInfo.data.items[0]?.snippet?.categoryId; // https://gist.github.com/dgp/1b24bf2961521bd75d6c
    const title = vidInfo.data.items[0]?.snippet?.title;
    const thumbnail = vidInfo.data.items[0]?.snippet?.thumbnails?.default?.url;
    const channelId = vidInfo.data.items[0]?.snippet?.channelId;
    if (!channelId) throw new HttpError(404, 'Channel not found');
    let channelTitle = vidInfo.data.items[0]?.snippet?.channelTitle;
    const defaultLanguage = vidInfo.data.items[0]?.snippet?.defaultLanguage?.includes('-')
      ? vidInfo.data.items[0]?.snippet?.defaultLanguage?.split('-')[0]
      : vidInfo.data.items[0]?.snippet?.defaultLanguage;
    const defaultAudioLanguage = vidInfo.data.items[0]?.snippet?.defaultAudioLanguage?.includes('-')
      ? vidInfo.data.items[0]?.snippet?.defaultAudioLanguage?.split('-')[0]
      : vidInfo.data.items[0]?.snippet?.defaultAudioLanguage;

    if (channelTitle?.includes(' - Topic')) {
      channelTitle = channelTitle.replace(' - Topic', '');
    }

    let captions;
    console.log('captions>> ', captions)
    try {
      captions = (await getSubtitles({
        videoID: videoId,
        lang: defaultLanguage || defaultAudioLanguage || 'en',
      })) as CaptionChunk[];
    } catch (error) {
      console.log('error >>> ', error);
    }
    

    if (captions) {
      const repeatedWords = countRepeatedWords(captions);
      // if youtube captions already exist, they tend to be more accurate than openai, so there's no need to generate.
      // but song captions often only contain the word 'music' or 'instrumental' repeated many times. In this case, we want to generate captions.
      if (repeatedWords.length > 2) {
        throw new HttpError(412, 'Captions already exist. No need to generate');
      }
    }

    let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {
      requestOptions: {
        headers: {
          cookie: process.env.YOUTUBE_COOKIE, // https://github.com/fent/node-ytdl-core/blob/master/example/cookies.js
        },
      },
    });
    let filteredFormat = ytdl.filterFormats(info.formats, 'audioonly');
    let audioFormat = ytdl.chooseFormat(filteredFormat, {
      quality: categoryId === '10' ? 'highestaudio' : 'lowestaudio',
    });
    console.log('audioFormat ', audioFormat);
    const audioStream = ytdl(url, { format: audioFormat }).pipe(
      fs.createWriteStream(path.join(__dirname, `${videoId}.${audioFormat.container}`))
    );
    const audioStreamPromise = new Promise((resolve, reject) => {
      audioStream.on('finish', resolve);
      audioStream.on('error', reject);
    });

    await audioStreamPromise;

    const filePath = path.join(__dirname, `${videoId}.${audioFormat.container}`);

    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    console.log('fileSizeInMegabytes ', fileSizeInMegabytes);
    if (fileSizeInMegabytes > 25) {
      throw new HttpError(413, 'File size is too large');
    }

    const file = fs.createReadStream(filePath);
    const model = 'whisper-1';
    const format = 'verbose_json';

    const accessToken = process.env.GENIUS_API_KEY;

    let lyrics = '';

    if (title && categoryId == '10' && transcribeWithLyrics) {
      try {
        const song = await axios.get(
          `https://api.genius.com/search?q=${encodeURIComponent(
            title + ' ' + channelTitle
          )}&access_token=${accessToken}`
        );

        let songUrl = song.data.response.hits[0].result.url;
        let doesArtistMatchLyrics = song.data.response.hits[0].result.artist_names.includes(channelTitle);
        console.log('doesArtistMatchLyrics >>> ', doesArtistMatchLyrics);
        console.log('songUrl >>> ', songUrl);
        if (songUrl && doesArtistMatchLyrics) {
          const lyricsResponse = await axios({
            method: 'GET',
            url: `${songUrl}`,
          });

          const $ = cheerio.load(lyricsResponse.data);

          // recursive function to get the text of each child of the lyrics div
          const getText = (el: any): string[] => {
            const text: string[] = [];
            $(el)
              .contents()
              .each((_, child) => {
                if (child.type === 'text') {
                  const chunk = $(child).text();
                  // remove double quotes from the string
                  const filteredChunk = chunk.replace(/"/g, '').trim();
                  text.push(filteredChunk);
                } else {
                  text.push(...getText(child));
                }
              });
            return text;
          };

          const lyricsDiv = $('[class^="Lyrics__Container"]');
          const text = getText(lyricsDiv);

          const filteredText1 = text.map((chunk) => chunk.trim());
          const filteredText2 = filteredText1.map((chunk) => chunk.replace(/“|”/g, ''));
          const filteredText3 = filteredText2.map((chunk) => chunk.replace(/\(|\)/g, ''));
          // remove brackets and words between brackets, e.g. [hook]
          const filteredText4 = filteredText3.map((chunk) => chunk.replace(/\[.*?\]/g, ''));
          const filteredText5 = filteredText4.filter((chunk) => chunk !== '');

          lyrics = filteredText5.join(' ');

          // console.log('lyrics >>> ', lyrics);
        }
      } catch (error) {
        console.error('error >>> ', error);
      }
    }

    const category = categoryId ? ytCategoryIds[Number(categoryId)] : 'general';

    const descriptionShortened =
      description?.length && description.length > 1000 ? description?.slice(0, 1000) : description;

    let prompt = `Transcript type: ${category}. Title: "${title}" by ${channelTitle}. ${
      description && `Description: ${descriptionShortened}.`
    }`;

    console.log('\nprompt >>>\n', categoryId == '10' ? (lyrics.length ? lyrics : undefined) : prompt);

    const resp = (await openai.createTranscription(
      // @ts-ignore
      file,
      model,
      categoryId == '10' ? (lyrics.length ? lyrics : undefined) : prompt,
      format
    )) as unknown as any;

    fs.unlinkSync(filePath);

    if (!resp.data.segments) throw new HttpError(400, 'Error generating captions');

    const timestampedCaptions: CaptionChunk[] = resp.data.segments.map((segment: any) => {
      return {
        start: String(segment.start),
        dur: String(segment.end - segment.start),
        text: segment.text,
      };
    });

    let youTuber = await context.entities.YouTuber.findFirst({
      where: { id: channelId },
    });

    if (!youTuber) {
      youTuber = await context.entities.YouTuber.create({
        data: {
          id: channelId,
          name: channelTitle || ' ',
        },
      });
    }

    return await context.entities.Caption.upsert({
      where: { videoId },
      create: {
        videoId,
        videoTitle: title || ' ',
        youTuberId: channelId,
        thumbnail: thumbnail,
        captionChunks: JSON.stringify(timestampedCaptions),
        transcribedWithLyrics: transcribeWithLyrics,
      },
      update: {
        captionChunks: JSON.stringify(timestampedCaptions),
        transcribedWithLyrics: transcribeWithLyrics,
      },
    });
  } catch (error: any) {
    throw error;
  }
};
