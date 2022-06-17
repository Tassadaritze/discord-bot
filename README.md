# discord-bot
A personal Discord bot

**If you stumbled on this page somehow, and you care enough, I'd appreciate constructive criticism in any form. :)**
# Usage
1. Create a .env in root directory
2. Add the line `DISCORD_TOKEN=your_token_here` to .env (replacing `your_token_here` with whatever your bot's Discord token is)
3. (optional) Add the lines `DANBOORU_USERNAME=your_danbooru_username_here` and `DANBOORU_API_KEY=your_danbooru_api_key_here` to .env (replacing `your_danbooru_username_here` and `your_danbooru_api_key_here` with your Danbooru username and an API key associated with that username with the `posts:random` permission, respectively) to enable /danbooru slash command functionality
4. Compile with TypeScript
5. Run main.js with node
