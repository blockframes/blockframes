
import { request, RequestOptions } from 'https';

export function sendRequest<T = unknown>(options: RequestOptions, data?: unknown): Promise<T> {
  const postData = JSON.stringify(data) ?? '';
  const postOptions: RequestOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    }
  };
	return new Promise((resolve, reject) => {
		const req = request(options.method === 'POST' ? postOptions : options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body) as T));
      res.on('error', e => reject(e))
		});
    req.on('error', e => reject(e));
    if (options.method === 'POST') req.write(postData);

    req.end();
	});
}
