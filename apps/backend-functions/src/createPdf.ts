import { MovieDocument, MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import type { Language } from "@blockframes/utils/static-model/types";
import { smartJoin, toLabel } from "@blockframes/utils/utils";
import { Response } from "firebase-functions";
import { db } from './internals/firebase';
import { festival } from '@blockframes/utils/static-model';
import { App, applicationUrl } from "@blockframes/utils/apps";
import { PdfRequest } from "@blockframes/utils/pdf/pdf.interfaces";
import { getImgIxResourceUrl } from "@blockframes/media/image/directives/imgix-helpers";

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

  const { titleIds, app } = req.body;
  if (!titleIds || !app) {
    res.status(500).send();
    return;
  }

  const appUrl = applicationUrl[app];
  const promises = titleIds.map(id => db.collection('movies').doc(id).get());
  const docs = await Promise.all(promises);
  const titles = docs.map(r => r.data() as MovieDocument).filter(m => !!m);

  const data: PdfTitleData[] = titles.map(m => {

    const prizes = m.prizes.concat(m.customPrizes).map(p => ({
      name: (festival[p.name] ? festival[p.name] : p.name).toUpperCase(),
      prize: p.prize ? `${p.prize.charAt(0).toUpperCase()}${p.prize.slice(1)}` : undefined,
      year: p.year,
      premiere: p.premiere ? `${toLabel(p.premiere, 'premiereType')} Premiere` : undefined
    }));

    const genres = [toLabel(m.genres, 'genres'), m.customGenres ? m.customGenres.join(', ') : ''].filter(g => g);
    const hasPublicVideos = m.promotional.videos.otherVideos?.some(video => video.storagePath && video.privacy === 'public');
    const title = `${appUrl}/c/o/marketplace/title/${m.id}/main`;
    return {
      title: m.title.international,
      contentType: toLabel(m.contentType, 'contentType'),
      genres: genres.join(', '),
      releaseYear: m.release.year,
      episodeCount: m.runningTime.episodeCount,
      runningTime: m.runningTime.time,
      synopsis: m.synopsis,
      posterUrl: m.poster?.storagePath ? getImgIxResourceUrl(m.poster, { h: 240, w: 180 }) : '',
      version: {
        original: toLabel(m.originalLanguages, 'languages', ', ', ' & '),
        isOriginalVersionAvailable: m.isOriginalVersionAvailable,
        languages: toLanguageVersionString(m.languages)
      },
      links: {
        title,
        trailer: hasPublicVideos ? `${title}#trailer` : ''
      },
      prizes
    }
  });

  const buffer = await generate('titles', app, data);

  res.set('Content-Type', 'application/pdf');
  res.set('Content-Length', buffer.length.toString());
  res.status(200).send(buffer);
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
  const posterFallback = fs.readFileSync(path.resolve(`assets/images/empty_poster.svg`), 'utf8');
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');
  const data = {
    css,
    appLogo: `data:image/svg+xml;utf8,${encodeURIComponent(logo)}`,
    posterFallback: `data:image/svg+xml;utf8,${encodeURIComponent(posterFallback)}`,
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

  const pageHeight = (await page.evaluate(() => document.documentElement.offsetHeight)) + 240; // 240 = 100 + 40 margins
  const maxHeight = 6000;
  const height = pageHeight < maxHeight ? pageHeight : maxHeight;

  const pdf = await page.pdf({
    height,
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