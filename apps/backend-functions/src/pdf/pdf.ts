import { MovieDocument } from "@blockframes/movie/+state/movie.firestore";
import { Request, Response } from "firebase-functions";
import { db } from './../internals/firebase';

export async function createPdf(templateName: string, data: any) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer')
  ]);

  // compile template with data into html
  const url = `assets/templates/${templateName}.html`;
  const file = fs.readFileSync(path.resolve(url), 'utf8');
  const template = hb.compile(file, { strict: true });
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

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const titlesData: { id: string, posterUrl: string}[] = req.body.titlesData || [];
  const data = {
    name: "Alan",
    hometown: "Somewhere, TX",
    titles: []
  };

  const promises = titlesData.map(data => db.collection('movies').doc(data.id).get());
  const docs = await Promise.all(promises);
  const titles = docs.map(r => r.data() as MovieDocument).filter(m => !!m);

  data.titles = titles.map(m => ({
    title: m.title.international,
    synopsis: m.synopsis,
    posterUrl: titlesData.find(data => data.id === m.id).posterUrl
  }));

  const buffer = await createPdf('titles', data);
  const file = { buffer, mimetype: 'application/pdf' };

  res.set('Access-Control-Allow-Origin', '*');

  res.set('Content-Type', file.mimetype);
  res.set('Content-Length', file.buffer.length.toString())
  res.status(200).send(file.buffer);
  return;
}