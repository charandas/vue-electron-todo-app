# A Todo App in Electron

## Build instructions
The build relies on both frontend build as well as a background process app build. Frontend uses JSPM, while the background process
is simply bundled with rollup.

### Frameworks used:
1. Backend: [Electron](https://github.com/electron/electron)
2. Frontend: [Vue](https://vuejs.org/)
3. Database: [LevelDB](https://github.com/Level/leveldown) with [sublevel](https://github.com/dominictarr/level-sublevel)

### Motivation:
1. I needed a todo app that allowed a template to start a fresh todo list for a given setup night at a non-profit I would volunteer at. Think Asana, but with slightly more customizable things such as alerts that can pop up in MacOS, are snoozable et cetera. I thought Electron works perfectly for that, right?
2. Secondly, I just wanted to muck around in LevelDB APIs and use it to build something real. With `sublevel`, I was able to introduce indexing and custom storage schema. (Update: 2023, I see that both of those level projects are now deprecated and that [classic-level](https://github.com/Level/classic-level) is succeeding LevelDown).
3. I wanted to build something in Vue.js at the time.


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
