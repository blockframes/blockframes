import { MovieDocument, MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import type { Language } from "@blockframes/utils/static-model/types";
import { smartJoin, toLabel } from "@blockframes/utils/utils";
import { Response } from "firebase-functions";
import { db } from './../internals/firebase';

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
  }
}

export async function createPdf(templateName: string, titles: PdfTitleData[]) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer')
  ]);

  const appLogo = 'archipel_content.svg';
  const logo = fs.readFileSync(path.resolve(`assets/logo/${appLogo}`), 'utf8');
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

  // @TODO #7045 remove fs.writeFileSync(path.resolve(`assets/templates/output-${templateName}.html`), html, 'utf8');

  // we are using headless mode
  const args = ['--no-sandbox', '--disable-setuid-sandbox'];
  const browser = await puppeteer.launch({ args: args });
  const page = await browser.newPage();

  // We set the page content as the generated html by handlebars
  await page.setContent(html, {
    waitUntil: 'networkidle0', // wait for page to load completely
  });
  await page.evaluateHandle('document.fonts.ready');
  const pdf = await page.pdf({ format: 'a4' });
  await browser.close();
  return pdf;
}


interface ToPdfRequest {
  method: string,
  body: {
    titlesData: {
      id: string,
      posterUrl: string
    }[],
    appUrl: string
  }
};
export const toPdf = async (req: ToPdfRequest, res: Response) => {

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (!req.body.titlesData) {
    res.status(500).send();
    return;
  }

  const titlesData = req.body.titlesData;
  const appUrl = req.body.appUrl;
  const promises = titlesData.map(data => db.collection('movies').doc(data.id).get());
  const docs = await Promise.all(promises);
  const titles = docs.map(r => r.data() as MovieDocument).filter(m => !!m);

  const data: PdfTitleData[] = titles.map(m => ({
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
    }
    // @TODO #7045 festivals
  }));

  const buffer = await createPdf('titles', data);
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
