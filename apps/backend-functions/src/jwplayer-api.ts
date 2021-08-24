
import { jwplayerApiV2Secret, jwplayerKey } from './environments/environment';

import { sendRequest } from './utils';


export function jwplayerApiV2() {
  const host = 'api.jwplayer.com';
  const headers = {
    'Authorization': `Bearer ${jwplayerApiV2Secret}`,
  };
  const basePath = `/v2/sites/${jwplayerKey}/media/`;

  return {
    get: (jwPlayerId: string) => sendRequest({
      host,
      headers,
      method: 'GET',
      path: `${basePath}${jwPlayerId}/`,
    }),
    create: (videoUrl: string, tag: 'production' | 'test') => sendRequest({
      host,
      headers,
      method: 'POST',
      path: basePath,
    }, {
      upload: {
        method: 'fetch',
        'download_url': videoUrl,
      },
      metadata: {
        tags: [ tag ],
      },
    }),
    delete: (jwPlayerId: string) => sendRequest({
      host,
      headers,
      method: 'DELETE',
      path: `${basePath}${jwPlayerId}/`,
    }),
  };
}
