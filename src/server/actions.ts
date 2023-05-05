import HttpError from '@wasp/core/HttpError.js';
import type { ScrapeCaptionsAndSave } from '@wasp/actions/types';
import type { Caption } from '@wasp/entities';
import type { CaptionChunk } from '@wasp/shared/types';
//@ts-ignore
import { getSubtitles } from 'youtube-captions-scraper';
import { youtube } from './utils.js';

type ScrapeArgs = {
  videoId: string;
};

export const scrapeCaptionsAndSave: ScrapeCaptionsAndSave<ScrapeArgs, Caption> = async (
  { videoId },
  context
) => {
  const info = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  });

  if (!info.data.items) throw new HttpError(404, 'Video not found');
  console.log('info.data.items.snippet >>> ', info.data.items[0]?.snippet);
  const title = info.data.items[0]?.snippet?.title;
  const thumbnail = info.data.items[0]?.snippet?.thumbnails?.default?.url;
  const channelId = info.data.items[0]?.snippet?.channelId;
  const channelTitle = info.data.items[0]?.snippet?.channelTitle;

  if (!channelId) throw new HttpError(404, 'Channel not found');

  const captions = (await getSubtitles({
    videoID: videoId,
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

};
