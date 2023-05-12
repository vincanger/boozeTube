import HttpError from '@wasp/core/HttpError.js';
import { youtube } from './utils.js';
import { countRepeatedWords } from './utils.js';
import type { GetCaptions, GetRepeatedWords, GetVideoInfo } from '@wasp/queries/types';
import type { CaptionChunk } from '@wasp/shared/types';

type CaptionsArgs = {
  id: string;
  chosenWord: string;
};

type VideoInfoResults = { thumbnail: string | null; videoTitle: string | null; youTuberId: string };

export const getVideoInfo: GetVideoInfo<{ id: string }, VideoInfoResults> = async ({ id }, context) => {
  const info = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  if (!info) throw new HttpError(404, 'Video not found');
  return {
    thumbnail: info?.thumbnail,
    videoTitle: info?.videoTitle,
    youTuberId: info.youTuberId,
  };
};

export const getRepeatedWords: GetRepeatedWords<{ id: string }, [string, number][]> = async ({ id }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  const captions: CaptionChunk[] = JSON.parse(caption?.captionChunks || '[]');

  captions.forEach((caption) => {
    caption.text = caption.text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      // remove all punctuation from beginning or end of words
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
      .trim()
      .toLowerCase();
  });

  console.log('captions >>> ', countRepeatedWords(captions))
  return countRepeatedWords(captions);
};

export const getCaptions: GetCaptions<CaptionsArgs, CaptionChunk[]> = async ({ id, chosenWord }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  let captions: CaptionChunk[] = JSON.parse(caption?.captionChunks || '[]')

  captions.forEach((caption) => {
    caption.text = caption.text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      // remove all punctuation from beginning or end of words
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
      .trim()
      .toLowerCase();
  });

  // filter caption objects if chosen word exists within the text property
  const filteredCaptions = captions.filter((caption) => {
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
