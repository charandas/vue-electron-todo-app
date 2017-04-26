# vzplayer
Vendizen player for Windows Store

## Build instructions
The build relies on both frontend build as well as a background process app build. Frontend uses JSPM, while the background process
is simply bundled with rollup.

### For production:
```
npm run release
// NOTE: the -- two times is necessary. The arguments after the first -- are not for npm, they are for the npm script
npm run release-to-store -- --version $VERSION
```

### For development:

1. Be sure to modify `config/local.json` with something like below. This would ensure you have access to devtools and such.
  ```
  {
    "NODE_ENV": "development",
    "app_path": "client/index.temp.html"
  }
  ```
2. Start the electron process:
  ```
  npm start
  ```
3. Start the frontend dev flow:
  ```
  npm run frontend-dev
  ```
