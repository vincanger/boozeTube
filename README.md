# 🍺ooze🍸ube

## Running it locally

1. Make sure you have the latest version of [Wasp](https://wasp-lang.dev) installed by running `curl -sSL https://get.wasp-lang.dev/installer.sh | sh` in your terminal.
2. Clone this repo and `cd` into it.
3. Make sure to get a Google API key for the youtube sdk and add it to a `.env.server` file in the root of the project. The key should be named `GOOGLE_API_KEY`.
4. Run `wasp db migrate-dev` and then run `wasp start`. This will init the DB, install all dependencies, and start the client and server for you :)
5. Go to `localhost:3000` (make sure no other dev servers are running on port 3000) in your browser (your NodeJS server will be running on port `3001`)
6. Install the Wasp extension for VSCode to get the best DX
7. Check out the docs for more info on wasp's [features](https://wasp-lang.dev/docs/language/features) and step-by-step [guides](https://wasp-lang.dev/docs)
