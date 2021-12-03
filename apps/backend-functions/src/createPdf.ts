import { MovieDocument, MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import type { Language } from "@blockframes/utils/static-model/types";
import { smartJoin, toLabel } from "@blockframes/utils/utils";
import { Response } from "firebase-functions";
import { db } from './internals/firebase';
import { festival } from '@blockframes/utils/static-model';
import { App, applicationUrl } from "@blockframes/utils/apps";

interface PdfTitleData {
  title: string,
  synopsis: string,
  posterUrl: string,
  version: {
    original: string,
    isOriginalVersionAvailable: boolean,
    languages: string,
  },
  links: {
    title: string,
    trailer: string,
  },
  prizes: { name: string, prize: string, year: number, premiere: string }[]
}

const appLogo: Partial<Record<App, string>> = {
  catalog: 'archipel_content.svg',
  festival: 'archipel_market.svg',
  financiers: 'media_financiers.svg',
}

interface PdfRequest {
  method: string,
  body: {
    titlesData: {
      id: string,
      posterUrl: string
    }[],
    app: App
  }
};

export const createPdf = async (req: PdfRequest, res: Response) => {

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (!req.body.titlesData || !req.body.app) {
    res.status(500).send();
    return;
  }

  const titlesData = req.body.titlesData;
  const appUrl = applicationUrl[req.body.app];
  const promises = titlesData.map(data => db.collection('movies').doc(data.id).get());
  const docs = await Promise.all(promises);
  const titles = docs.map(r => r.data() as MovieDocument).filter(m => !!m);

  const data: PdfTitleData[] = titles.map(m => {

    const prizes = m.prizes.concat(m.customPrizes).map(p => ({
      name: (festival[p.name] ? festival[p.name] : p.name).toUpperCase(),
      prize: p.prize ? `${p.prize.charAt(0).toUpperCase()}${p.prize.slice(1)}` : undefined,
      year: p.year,
      premiere: p.premiere ? `${toLabel(p.premiere, 'premiereType')} Premiere` : undefined
    }));

    return {
      title: m.title.international,
      releaseYear: m.release.year,
      runningTime: m.runningTime.time,
      synopsis: m.synopsis,
      posterUrl: titlesData.find(data => data.id === m.id).posterUrl,
      version: {
        original: toLabel(m.originalLanguages, 'languages', ', ', ' & '),
        isOriginalVersionAvailable: m.isOriginalVersionAvailable,
        languages: toLanguageVersionString(m.languages)
      },
      links: {
        title: `${appUrl}/c/o/marketplace/title/${m.id}/main`,
        trailer: `${appUrl}/c/o/marketplace/title/${m.id}/main`
      },
      prizes
    }
  });

  const buffer = await generate('titles', req.body.app, data);
  const file = { buffer, mimetype: 'application/pdf' };

  res.set('Content-Type', file.mimetype);
  res.set('Content-Length', file.buffer.length.toString());
  res.status(200).send(file.buffer);
  return;
}

function toLanguageVersionString(languages: Partial<{ [language in Language]: MovieLanguageSpecification }>) {
  return Object.entries(languages).map(([language, specs]) => {
    const types = [];

    if (specs.subtitle) {
      types.push(toLabel('subtitle', 'movieLanguageTypes'));
    }

    if (specs.dubbed) {
      types.push(toLabel('dubbed', 'movieLanguageTypes'));
    }

    if (specs.caption) {
      types.push(toLabel('caption', 'movieLanguageTypes'));
    }

    if (types.length) {
      return `${toLabel(language, 'languages')} ${smartJoin(types, ', ', ' & ')}`;
    }

  }).filter(d => d).join(', ');
}


async function generate(templateName: string, app: App, titles: PdfTitleData[]) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer')
  ]);

  const logo = fs.readFileSync(path.resolve(`assets/logo/${appLogo[app]}`), 'utf8');
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');
  const data = {
    css,
    appLogo: `data:image/svg+xml;utf8,${encodeURIComponent(logo)}`,
    titles
  };

  // compile template with data into html
  const url = `assets/templates/${templateName}.html`;
  const file = fs.readFileSync(path.resolve(url), 'utf8');
  const template = hb.compile(file, { strict: true });
  const html = template(data);

  // @dev to see html output (without header and footer), uncomment this line
  // fs.writeFileSync(path.resolve(`assets/templates/output-${templateName}.html`), html, 'utf8');

  // we are using headless mode
  const args = ['--no-sandbox', '--disable-setuid-sandbox'];
  const browser = await puppeteer.launch({ args: args });
  const page = await browser.newPage();

  // Wait for the page to load completely
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');


  const cssHeader = [];
  cssHeader.push('<style>');
  cssHeader.push('header {width: 100%; text-align: center;}');
  cssHeader.push('header img {height: 48px; width: 144px}')
  cssHeader.push('</style>');

  const cssFooter = [];
  cssFooter.push('<style>');
  cssFooter.push('h1 { font-size:8px; margin-left:30px;}');
  cssFooter.push('</style>');

  const pageHeight = (await page.evaluate(() => document.documentElement.offsetHeight)) + 240; // 240 = 100 + 40 margins
  const affordableMaxPageHeight = 6000;
  const affordableHeight = pageHeight < affordableMaxPageHeight ? pageHeight : affordableMaxPageHeight;

  const pdf = await page.pdf({
    height: affordableHeight,
    displayHeaderFooter: true,
    headerTemplate: `${cssHeader.join('')}<header class="header"><img src="data:image/svg+xml;utf8,${encodeURIComponent(logo)}"></header>`,
    footerTemplate: `<p></p>`, // If left empty, default is page number
    margin: {
      top: '100px',
      bottom: '40px',
    }
  });
  await browser.close();
  return pdf;
}