# Tech Host Assistant

## Build instructions
The build relies on both frontend build as well as a background process app build. Frontend uses JSPM, while the background process
is simply bundled with rollup.

### For development:

1. Start the electron process:
  ```
  npm install
  npm start
  ```
2. Start the frontend dev flow:
  ```
  npm run frontend-dev
  ```
