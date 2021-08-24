
import { get } from 'https';
import { sign } from 'jsonwebtoken';
import * as admin from 'firebase-admin';
import { Request, Response } from 'firebase-functions';
import { getStorageBucketName } from './internals/firebase';
import { sendRequest } from './utils';

const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds


/** Return the new url of a 302 REDIRECT request */
function fetchRedirect(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		get(url, res => {
		    resolve(res.headers.location);
		}).on('error', e => {
		    reject(e);
		});
	});
}

function transferFile(url: string, remoteFilePath: string) {
  return new Promise<void>((resolve, reject) => {
    const bucket = admin.storage().bucket(getStorageBucketName());
    const storageFile =  bucket.file(remoteFilePath);
    const storageStream = storageFile.createWriteStream();
    get(url, res => {
      res.pipe(storageStream).on('finish', () => resolve());
      res.on('error', e => reject(e));
    });
  });
}

export const downloadVideo = async (req: Request, res: Response) => {

  /**
   * @param storagePath should not start and end with a `/`
  */
  const { jwPlayerId, jwPlayerSecret, storagePath } = req.query;

  // CHECK PARAMETERS

  if (!jwPlayerId || typeof jwPlayerId !== 'string') {
    res.status(400).json('Missing or wrong query param "jwPlayerId", it must be a string!');
    return;
  }

  if (!jwPlayerSecret || typeof jwPlayerSecret !== 'string') {
    res.status(400).json('Missing or wrong query param "jwPlayerSecret", it must be a string!');
    return;
  }

  if (!storagePath || typeof storagePath !== 'string') {
    res.status(400).json('Missing or wrong query param "storagePath", it must be a string!');
    return;
  }

  const start = Date.now();

  // COMPUTE JSON WEB TOKEN

  const expires = Math.floor(new Date().getTime() / 1000) + linkDuration; // now + 5 hours

  const payload = { resource: `/v2/media/${jwPlayerId}`, exp: expires };

  const token = sign(payload, jwPlayerSecret);

  // GET THE LIST OF ENCODED FILE FOR A GIVEN VIDEO

  const apiResult = await sendRequest({
    method: 'GET',
    host: 'cdn.jwplayer.com',
    path: `/v2/media/${jwPlayerId}?token=${token}`,
  }) as any;

  // FILTER THE RESPONSE TO GET THE URL OF THE HIGHEST DEFINITION VIDEO FILE

  const fileName = apiResult.title;
  const [video] = apiResult.playlist[0].sources
    .filter(source => source.type === 'video/mp4')
    .sort((a, b) => b.filesize - a.filesize); // we want the biggest file first

  const mp4FileUrl = video.file;

  // REAL FILE URL IS HIDDEN BEHIND A 302 REDIRECT

  const realFileUrl = await fetchRedirect(mp4FileUrl);

  // DOWNLOAD FILE FROM JWP TO BUCKET (INTO STORAGE_PATH)

  await transferFile(realFileUrl, `${storagePath}/${fileName}`);


  res.status(200).json({fileName, video, realFileUrl, storagePath, time: Date.now() - start });
  return;
};
