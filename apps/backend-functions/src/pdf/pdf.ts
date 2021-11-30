import { Request, Response } from "firebase-functions";


//import fs from 'fs';

export async function createPdf(templateName: string, data: any) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer')
  ]);

  // compile template with data into html
  //const url = `../assets/templates/${templateName}.html`;
  //const file = fs.readFileSync(path.resolve(url), 'utf8');
  //const template = hb.compile(file, { strict: true });
  //const html = template(data);

  const source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
    "{{kids.length}} kids:</p>" +
    "<ul>{{#kids}}<li>{{name}} is {{age}} <img src=\"{{img}}\"></li>{{/kids}}</ul>";
  const template = hb.compile(source);
  const html = template(data);

  // we are using headless mode
  const args = ['--no-sandbox', '--disable-setuid-sandbox'];
  const browser = await puppeteer.launch({ args: args });
  const page = await browser.newPage();

  // We set the page content as the generated html by handlebars
  await page.setContent(html, {
    waitUntil: 'networkidle0', // wait for page to load completely
  });
  const pdf = await page.pdf({ format: 'a4' });
  await browser.close();
  return pdf;
}


export const toPdf = async (req: Request, res: Response) => {

  console.log(req.body)
  const data = {
    "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [
      { "name": "Jimmy", "age": "12", img: 'https://blockframes-bruce.imgix.net/movies/02L9gsoY4WTdGbxpOKha/poster/thekillingoftwolovers_keyart.webp?fm=png&h=240&w=180' },
      { "name": "Sally", "age": "4", img: 'https://blockframes-bruce.imgix.net/movies/02L9gsoY4WTdGbxpOKha/poster/thekillingoftwolovers_keyart.webp?fm=png&h=240&w=180' }
    ]
  };


  const buffer = await createPdf('test', data)
  const file = { buffer, mimetype: 'application/pdf' };


  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', ['GET','POST']);
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return ;
  }
  res.set('Content-Type', file.mimetype);
  res.set('Content-Length', file.buffer.length.toString())
  res.status(200).send(file.buffer);
  return;
}