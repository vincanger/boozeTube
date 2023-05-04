import fs from 'fs';
import fetch from 'node-fetch';
import { getSubtitles } from 'youtube-captions-scraper';
import { google } from 'googleapis';

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyBOzrY6RB7gkIvrMgEVauf82cP3l7LEqnc',
});


type Caption = {
  text: string;
  start: number;
  duration: number;
};

const getCaptionsFromYoutube = async (id: string) => {
  const info = await youtube.videos.list({
    part: ['snippet'],
    id: [id],
  });

  const title = info.data.items[0].snippet.title;
  console.log('snippet>>> ', info.data.items[0].snippet);
  console.log('title>>> ', title)

  const captions = await getSubtitles({
    videoID: id
  }) as Caption[];

  console.log(captions)
  return captions
};

const getEntireCaptionStr = (captions: Caption[]) => {
  let entireCaptionStr = '';
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    const cleanText = caption.text.trim().toLowerCase() + ' ';
    entireCaptionStr += cleanText
  }

  return entireCaptionStr;
};

const countRepeatedWords = (captions: string) => {

  const words = captions.split(/\s+/);

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
    'more',
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
    'no',
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

  return sortedWordCounts.filter(([word, count]) => !fillers.has(word));

};

// make a call to the openai api 


const run = async () => {
  const captions = await getCaptionsFromYoutube('hgglCqAXHuE'); // t3 stack is changing
  // const captions = await getCaptionsFromYoutube('AUZBmvBWsRg'); // google developers
  // const captions = await getCaptionsFromYoutube('w7i4amO_zaE');
  const entireCaptionStr = getEntireCaptionStr(captions);
  // const wordCounts = countRepeatedWords(entireCaptionStr);
  // console.log(wordCounts);

  // const repeatedWords = Array.from(wordCounts).filter(([word, count]) => count > 5);
  // // sort by count in descending order
  // repeatedWords.sort((a, b) => b[1] - a[1]);
  // console.log(repeatedWords);
}

run();