import { CaptionChunk } from '@wasp/shared/types';
import { google } from 'googleapis';
import { Configuration, OpenAIApi } from 'openai';

export const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

const fillers = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'if',
  'so',
  'in',
  'of',
  'for',
  'to',
  'with',
  'on',
  'at',
  'from',
  'by',
  'about',
  'as',
  'into',
  'onto',
  'upon',
  'before',
  'after',
  'since',
  'until',
  'while',
  'through',
  'across',
  'behind',
  'below',
  'beneath',
  'beside',
  'between',
  'beyond',
  'near',
  'above',
  'after',
  'because',
  'though',
  'although',
  'unless',
  'except',
  'nor',
  'not',
  'neither',
  'either',
  'yet',
  'just',
  'only',
  'even',
  'already',
  'still',
  'lot',
  'much',
  'very',
  'too',
  'really',
  'well',
  'truly',
  'simply',
  'actually',
  'now',
  'then',
  'when',
  'while',
  'there',
  'here',
  'where',
  'every',
  'any',
  'some',
  'such',
  'none',
  'own',
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
  'which',
  'what',
  'who',
  'whom',
  'whose',
  'how',
  'why',
  'that',
  'is',
  'was',
  'be',
  'been',
  'are',
  'will',
  'would',
  'should',
  'could',
  'can',
  'may',
  'might',
  'must',
  'shall',
  'ought',
  'need',
  'dare',
  'used',
  'had',
  'has',
  'have',
  'having',
  'did',
  'done',
  'doing',
  'do',
  'i',
  "i'm",
  'you',
  'it',
  'this',
  'like',
  'we',
  "don't",
  "doesn't",
  "didn't",
  "we're",
  'me',
  'them',
  'there',
  "there's",
  'they',
  "they're",
  "you're",
  "i've",
  "i'll",
  "i'd",
  "he's",
  "she's",
  "he'll",
  "she'll",
  "he'd",
  "she'd",
  "we've",
  "we'll",
  "we'd",
  "they've",
  "they'll",
  "they'd",
  "it's",
  "it'll",
  "it'd",
  "that's",
  "that'll",
  "that'd",
  "who's",
  "who'll",
  "who'd",
  "what's",
  "what'll",
  "what'd",
  "where's",
  "where'll",
  "where'd",
  "when's",
  "when'll",
  "when'd",
  "why's",
  "why'll",
  "why'd",
  "how's",
]);

const getEntireCaptionStr = (captions: CaptionChunk[]) => {
  let entireCaptionStr = '';
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    const cleanText = caption.text.trim().toLowerCase() + ' ';
    entireCaptionStr += cleanText;
  }

  return entireCaptionStr;
};

export const countRepeatedWords = (captionChunks: CaptionChunk[]) => {
  const captions = getEntireCaptionStr(captionChunks);

  const words = captions.split(/\s+/);

  //remove all punctuation from beginning or end of words
  // const words = captionsWithStuff.map((word) => {
  //   return word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
  // });

  const wordCounts: Map<string, number> = new Map();

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const count = wordCounts.get(word) || 0;
    wordCounts.set(word, count + 1);
  }

  // remove words that are used less than 5 times
  wordCounts.forEach((count, word) => {
    if (count < 5) {
      wordCounts.delete(word);
    }
  });

  const sortedWordCounts = Array.from(wordCounts).sort((a, b) => b[1] - a[1]);

  return sortedWordCounts.filter(([word, count]) => !fillers.has(word));
};

export const ytCategoryIds: Record<number, string> = {
  1: 'Film & Animation',
  2: 'Autos & Vehicles',
  10: 'Music',
  15: 'Pets & Animals',
  17: 'Sports',
  18: 'Short Movies',
  19: 'Travel & Events',
  20: 'Gaming',
  21: 'Videoblogging',
  22: 'People & Blogs',
  23: 'Comedy',
  24: 'Entertainment',
  25: 'News & Politics',
  26: 'Howto & Style',
  27: 'Education',
  28: 'Science & Technology',
  29: 'Nonprofits & Activism',
  30: 'Movies',
  31: 'Anime/Animation',
  32: 'Action/Adventure',
  33: 'Classics',
  34: 'Comedy',
  35: 'Documentary',
  36: 'Drama',
  37: 'Family',
  38: 'Foreign',
  39: 'Horror',
  40: 'Sci-Fi/Fantasy',
  41: 'Thriller',
  42: 'Shorts',
  43: 'Shows',
  44: 'Trailers',
};
