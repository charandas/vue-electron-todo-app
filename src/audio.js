import Bluebird from 'bluebird';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import uuidV4 from 'uuid/v4';
import { BrowserWindow } from 'electron';

import { getLogger } from './app_ready';

const logger = getLogger({ label: 'audio' });

export function extractAudioFromVideo ({ movieUrl, taskId = uuidV4() }) {
  const dirname = path.dirname(movieUrl);
  const extname = path.extname(movieUrl);
  const filename = path.basename(movieUrl, extname);
  const outputUrl = path.resolve(dirname, `${filename}-audio.mp3`);
  const mainWindow = BrowserWindow.getFocusedWindow();

  logger.silly(`ffmpeg from path: ${ffmpegStatic.path}`);

  return new Bluebird((resolve, reject) => {
    ffmpeg(movieUrl)
      .setFfmpegPath(ffmpegStatic.path)
      .audioBitrate('192k')
      .noVideo()
      .audioCodec('libmp3lame')
      // .audioChannels(2)
      // .outputOptions('-vn', '-c:a', 'libmp3lame', '-b:a', '192k')
      .on('error', function (err) {
        logger.error('An error occurred: ', err.message, err.stack);
        reject(err);
      })
      .on('progress', progress => {
        mainWindow.webContents.send('extractAudioProgress', Object.assign({}, progress, { taskId, outputUrl, dirname }));
        logger.info(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        logger.info(`Processing finished and produced ${outputUrl}.`);
        resolve({ processed: true });
      })
      .save(outputUrl);
  });
}

