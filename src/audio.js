import Bluebird from 'bluebird';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { getLogger } from './app_ready';

const logger = getLogger({ label: 'audio' });

export function extractAudioFromVideo (movieUrl = '/Users/charandas/Movies/ManyCam/test.mp4') {
  const dirname = path.dirname(movieUrl);
  const extname = path.extname(movieUrl);
  const filename = path.basename(movieUrl, extname);
  const outputUrl = path.resolve(dirname, `${filename}-audio${extname}`);

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
      .on('data', chunk => { // TODO: not invoked for save, may be useful for a progress bar
        logger.info(`Wrote ${chunk.length} bytes`);
      })
      .on('end', () => {
        logger.info(`Processing finished and produced ${outputUrl}.`);
        resolve({ processed: true });
      })
      .save(outputUrl);
  });
}

