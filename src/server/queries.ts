import HttpError from '@wasp/core/HttpError.js';
import { youtube } from './utils.js';
import { countRepeatedWords } from './utils.js';
import type { GetCaptions, GetRepeatedWords, GetVideoInfo, GetCaptionsInfo } from '@wasp/queries/types';
import type { CaptionChunk } from '@wasp/shared/types';
import { Caption } from '@wasp/entities/index.js';

type CaptionsArgs = {
  id: string;
  chosenWord: string;
};

type VideoInfoResults = {
  thumbnail: string | undefined | null;
  videoTitle: string | undefined | null;
  youTuberId: string;
};

export const getVideoInfo: GetVideoInfo<{ id: string }, VideoInfoResults> = async ({ id }, context) => {
  // let info = await context.entities.Caption.findFirst({
  //   where: { videoId: id },
  // }) as unknown as any;

  let info = await youtube.videos.list({
    part: ['snippet'],
    id: [id],
  });

  if (!info.data.items) throw new HttpError(404, 'Video not found');

  const title = info.data.items[0]?.snippet?.title;
  const thumbnail = info.data.items[0]?.snippet?.thumbnails?.default?.url;
  const youTuberId = info.data.items[0]?.snippet?.channelId;

  // throw new HttpError(404, 'Video not found');

  return {
    thumbnail: thumbnail,
    videoTitle: title,
    youTuberId: youTuberId || '',
  };
};

export const getCaptionsInfo: GetCaptionsInfo<{ id: string }, Caption | null> = async (
  { id },
  context
) => {
  return await context.entities.Caption.findFirst({
    where: { videoId: id },
  });
};

export const getRepeatedWords: GetRepeatedWords<{ id: string }, [string, number][]> = async ({ id }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  const captions: CaptionChunk[] = JSON.parse(caption?.captionChunks || '[]');

  const cleanedCaptions = captions.map((caption) => {
    // split the text into an array of words and remove any punctuation 
    const text = caption.text.split(/\s+/).map((word) => {
      return word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .trim()
        .toLowerCase()
    }).join(' ');

    return {
      ...caption,
      text: text
    };
  });


  console.log('captions >>> ', countRepeatedWords(cleanedCaptions));
  return countRepeatedWords(cleanedCaptions);
};

export const getCaptions: GetCaptions<CaptionsArgs, CaptionChunk[]> = async ({ id, chosenWord }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  let captions: CaptionChunk[] = JSON.parse(caption?.captionChunks || '[]');

  // captions.forEach((caption) => {
  //   caption.text = caption.text
  //     .replace(/(\r\n|\n|\r)/gm, ' ')
  //     // remove all punctuation from beginning or end of words
  //     .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
  //     .trim()
  //     .toLowerCase();
  // });

  const cleanedCaptions = captions.map((caption) => {
    // split the text into an array of words and remove any punctuation
    const text = caption.text
      .split(/\s+/)
      .map((word) => {
        return word
          .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
          .replace(/(\r\n|\n|\r)/gm, ' ')
          .trim()
          .toLowerCase();
      })
      .join(' ');

    return {
      ...caption,
      text: text,
    };
  });

  // filter caption objects if chosen word exists within the text property
  const filteredCaptions = cleanedCaptions.filter((caption) => {
    const regex = new RegExp('\\b' + chosenWord.toLowerCase() + '\\b', 'gi');
    const wordCount = (caption.text.match(regex) || []).length;
    return wordCount > 0;
  });

  return filteredCaptions;
};

async function getChannelId(username: string) {
  const response = await youtube.search.list({
    part: ['id'],
    type: ['channel'],
    q: username,
  });
  if (!response.data.items) throw new Error('No channel found');
  return response.data.items[0].id?.channelId;
}
