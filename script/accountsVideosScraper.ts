// Import the Google API client library
import { google } from 'googleapis';

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: '',
});

// Set the YouTube account ID
let channelId = '';

// Set the number of videos to retrieve per API call (max 50)
const maxResults = 50;

async function getChannelId(username: string) {
  const response = await youtube.search.list({
    part: ['id'],
    type: ['channel'],
    q: username,
  })
  if (!response.data.items) throw new Error('No channel found')
  channelId = response.data.items[0].id.channelId;
}

// Define a function to retrieve the next page of videos
async function getNextVideosPage(pageToken: string | null) {
  // Call the YouTube Data API to retrieve the videos
  const response = await youtube.search.list({
    channelId: channelId,
    pageToken,
    maxResults,
    part: ['id, snippet'],

  });

  // Extract the video IDs from the API response
  const videoIds = response.data.items.map((item) => item.id.videoId);
  console.log('videoIds>>> ', videoIds)
  console.log('nextPageToken>>> ', response.data.nextPageToken)

  // Return the video IDs and the next page token
  return {
    videoIds: videoIds,
    nextPageToken: response.data.nextPageToken,
  };
}

// Define a function to retrieve all the video IDs for a given YouTube account
async function getAllVideoIds(username: string) {
  await getChannelId(username);
  let videoIds: string[] = [];
  let nextPageToken: string | null = null;

  // Retrieve the first page of videos
  const firstPage = await getNextVideosPage(null);
  videoIds = videoIds.concat(firstPage.videoIds);
  nextPageToken = firstPage.nextPageToken;

  // Retrieve subsequent pages of videos until there are no more pages
  while (nextPageToken != null) {
    const nextPage = await getNextVideosPage(nextPageToken);
    videoIds = videoIds.concat(nextPage.videoIds);
    nextPageToken = nextPage.nextPageToken;
  }

  // Return the final list of video IDs
  return videoIds;
}

const run = async (username: string) => {

  // Call the getAllVideoIds function to retrieve all the video IDs for the YouTube account
  const videoIds = await getAllVideoIds(username);
  return videoIds.filter((id) => id);
}

run('t3dotgg');