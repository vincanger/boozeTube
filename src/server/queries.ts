import HttpError from '@wasp/core/HttpError.js';
import type { GetCaptions, GetRepeatedWords } from '@wasp/queries/types';
import type { Caption } from '@wasp/entities';
import type { CaptionChunk } from '@wasp/shared/types';
import { countRepeatedWords } from './utils.js';
//@ts-ignore
import { getSubtitles } from 'youtube-captions-scraper';
import { google } from 'googleapis';

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyBOzrY6RB7gkIvrMgEVauf82cP3l7LEqnc',
});

type CaptionsArgs = {
  id: string;
  chosenWord: string;
};

export const getRepeatedWords: GetRepeatedWords<{ id: string }, [string, number][]> = async ({ id }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  const captions: CaptionChunk[] = JSON.parse(caption?.captionChunks || '[]');

  captions.forEach((caption) => {
    caption.text = caption.text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .trim()
      .toLowerCase();
  });

  return countRepeatedWords(captions);
};

export const getCaptions: GetCaptions<CaptionsArgs, CaptionChunk[]> = async ({ id, chosenWord }, context) => {
  const caption = await context.entities.Caption.findFirst({
    where: { videoId: id },
  });

  console.log('id >>> ', id);
  // console.log('caption >>> ', caption);

  let captions: CaptionChunk[] | undefined;

  captions = JSON.parse(caption?.captionChunks || '[]') as CaptionChunk[];

  captions.forEach((caption) => {
    caption.text = caption.text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .trim()
      .toLowerCase();
  });

  console.log('captions >>> ', captions);

  // filter caption objects if chosen word exists within the text property
  const filteredCaptions = captions.filter((caption) => {
    // TODO: use regex to match whole words only
    const regex = new RegExp('\\b' + chosenWord.toLowerCase() + '\\b', 'gi');
    const wordCount = (caption.text.match(regex) || []).length;
    return wordCount > 0;
  });

  console.log(filteredCaptions);
  return filteredCaptions;
};
