# 🍺ooze🍸ube

## What is this?
[BoozeTube](https://boozetube.netlify.app) is an app that can turn almost any youtube video into a drinking game. 

It works by using the [Youtube Data API](https://developers.google.com/youtube/v3) to get the video's captions. 
If they don't exist, we download the audio source and feed it to [OpenAI's Whisper API](https://platform.openai.com/docs/guides/speech-to-text) to generate captions.

Users can then select a word to track. The timestamps on the captions are then compared with the current video's playback time to calculate and alert the user each time that word appears in the audio transcript.

Fun! 🍻

## Running it locally

This app was built using:
- React, 
- NodeJS, 
- and Prisma w/ Postgres 
via a fullstack framework called [Wasp](https://wasp-lang.dev) that makes building serverful fullstack apps fast and easy.

1. Make sure you have the latest version of [Wasp](https://wasp-lang.dev) installed by running `curl -sSL https://get.wasp-lang.dev/installer.sh | sh` in your terminal.
2. Clone this repo and `cd` into it.
3. Rename the `env.server.example` file to `.env.server` in the root of the project and fill in the listed API keys. 
4. Run `wasp db migrate-dev` and then run `wasp start`. This will init the DB, install all dependencies, and start the client and server for you :)
5. Go to `localhost:3000` (make sure no other dev servers are running on port 3000) in your browser (your NodeJS server will be running on port `3001`)
6. Install the Wasp extension for VSCode to get the best DX
7. Check out the docs for more info on wasp's [features](https://wasp-lang.dev/docs/language/features) and step-by-step [guides](https://wasp-lang.dev/docs)
