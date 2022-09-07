import { festival, App, Movie, smartJoin, displayName, Term, Duration, Mandate, Organization } from '@blockframes/model';
import { toLabel } from '@blockframes/model';
import { Response } from 'firebase-functions';
import { applicationUrl } from '@blockframes/utils/apps';
import { PdfRequest } from '@blockframes/utils/pdf/pdf.interfaces';
import { getImgIxResourceUrl } from '@blockframes/media/image/directives/imgix-helpers';
import { getDb, getDocument, getStorage, queryDocuments } from '@blockframes/firebase-utils';
import { allOf } from '@blockframes/contract/avails/sets';
import { storageBucket } from './environments/environment';

interface PdfTitleData {
  title: string;
  contentType: string;
  genres: string;
  releaseYear: number;
  episodeCount: number;
  originCountries: string;
  format: string;
  runningTime: number;
  synopsis: string;
  posterUrl: string;
  cast: string;
  version: {
    original: string;
    isOriginalVersionAvailable: boolean;
    subtitles: string;
    dubs: string;
  };
  links: {
    title: string;
    trailer: string;
    avails: string;
  };
  prizes: { name: string; prize: string; year: number; premiere: string }[];
  certifications: { desc: string; flag: string; }[]
}

const appLogo: Partial<Record<App, string>> = {
  catalog: 'archipel_content.svg',
  festival: 'archipel_market.svg',
  financiers: 'media_financiers.svg',
};

const getPrizes = (m: Movie) => {
  return m.prizes.concat(m.customPrizes).map((p) => ({
    name: (festival[p.name] ? festival[p.name] : p.name).toUpperCase(),
    prize: p.prize ? `${p.prize.charAt(0).toUpperCase()}${p.prize.slice(1)}` : undefined,
    year: p.year,
    premiere: p.premiere ? `${toLabel(p.premiere, 'premiereType')} Premiere` : undefined,
  }));
}

const getGenres = (m: Movie) => {
  return [
    toLabel(m.genres, 'genres'),
    m.customGenres ? m.customGenres.join(', ') : '',
  ].filter((g) => g).join(', ');
}

const getSubs = (m: Movie) => {
  const subtitles = Object.entries(m.languages)
    .map(([language, specs]) => {
      if (specs.subtitle) return language;
    }).filter(s => s);

  return toLabel(subtitles, 'languages', ', ', ' & ');
}

const getDubs = (m: Movie) => {
  const dubs = Object.entries(m.languages)
    .map(([language, specs]) => {
      if (specs.dubbed) return language;
    }).filter(d => d);

  return toLabel(dubs, 'languages', ', ', ' & ');
}

const getLogo = async (app: App, fs: any, path: any, orgId?: string) => {
  const logo = fs.readFileSync(path.resolve(`assets/logo/${appLogo[app]}`), 'utf8');
  const htmlLogo = {
    tag: `<img src="data:image/svg+xml;utf8,${encodeURIComponent(logo)}">`,
    width: '144px',
    height: '48px'
  };

  if (orgId) {
    const { logo } = await getDocument<Organization>(`orgs/${orgId}`);

    if (logo.storagePath) {

      const bucket = getStorage().bucket(storageBucket);
      const filePath = `${logo.privacy}/${logo.storagePath}`;
      const fileObject = bucket.file(filePath);
      const [image] = await fileObject.download();

      htmlLogo.tag = `<img src="data:image/webp;base64,${image.toString('base64')}">`;
      htmlLogo.width = '48px';
    }
  }

  return htmlLogo;
}

const hasPublicVideos = (m: Movie, app: App) => {
  const hasOtherVideos = m.promotional.videos.otherVideos?.some(v => v.storagePath && v.privacy === 'public');
  const hasPublicScreener = app === 'catalog' && !!m.promotional.videos.publicScreener?.jwPlayerId;
  return hasOtherVideos || hasPublicScreener;
}

const hasAvails = async (m: Movie, app: App, db = getDb()) => {
  if (app !== 'catalog') return false;

  const query = db.collection(`contracts`)
    .where('titleId', '==', m.id)
    .where('status', '==', 'accepted')
    .where('type', '==', 'mandate');
  const mandates = await queryDocuments<Mandate>(query);

  const mandateTermsIds = mandates.map(mandate => mandate.termIds).flat();

  const terms = await Promise.all(mandateTermsIds.map(termId => getDocument<Term>(`terms/${termId}`)));

  const date = new Date();
  const duration: Duration = {
    from: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    to: new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
  }

  return terms.some(t => allOf(duration).in(t.duration));
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

  const { titleIds, app, pageTitle, orgId } = req.body;
  if (!titleIds || !app) {
    res.status(500).send();
    return;
  }

  const db = getDb();
  const appUrl = applicationUrl[app];
  const promises = titleIds.map((id) => getDocument<Movie>(`movies/${id}`));
  const docs = await Promise.all(promises);
  const titles = docs.filter((m) => !!m);

  const [fs, path] = await Promise.all([import('fs'), import('path')]);

  const europeFlag = fs.readFileSync(path.resolve(`assets/images/europe.svg`), 'utf8');
  const franceFlag = fs.readFileSync(path.resolve(`assets/images/france.svg`), 'utf8');

  const data: PdfTitleData[] = [];

  for (const m of titles) {

    const titleBasePath = `${appUrl}/c/o/marketplace/title/${m.id}`;

    const pdfTitle: PdfTitleData = {
      title: m.title.international,
      contentType: toLabel(m.contentType, 'contentType'),
      genres: getGenres(m),
      releaseYear: m.release.year,
      episodeCount: m.runningTime.episodeCount,
      originCountries: toLabel(m.originCountries, 'territories'),
      format: toLabel(m.format, 'movieFormat'),
      runningTime: m.runningTime.time,
      synopsis: m.synopsis,
      posterUrl: m.poster?.storagePath ? getImgIxResourceUrl(m.poster, { h: 240, w: 180 }) : '',
      cast: smartJoin(m.cast.slice(0, 3).map(person => displayName(person))),
      version: {
        original: toLabel(m.originalLanguages, 'languages', ', ', ' & '),
        isOriginalVersionAvailable: m.isOriginalVersionAvailable,
        subtitles: getSubs(m),
        dubs: getDubs(m),
      },
      links: {
        title: `${titleBasePath}/main`,
        trailer: hasPublicVideos(m, app) ? `${titleBasePath}/main#trailer` : '',
        avails: await hasAvails(m, app, db) ? `${titleBasePath}/avails/map` : '',
      },
      prizes: getPrizes(m),
      certifications: []
    };

    if (m.certifications.some(c => c === 'eof')) {
      pdfTitle.certifications.push({
        desc: toLabel('eof', 'certifications'),
        flag: `data:image/svg+xml;utf8,${encodeURIComponent(franceFlag)}`,
      });
    }

    if (m.certifications.some(c => c === 'europeanQualification')) {
      pdfTitle.certifications.push({
        desc: toLabel('europeanQualification', 'certifications'),
        flag: `data:image/svg+xml;utf8,${encodeURIComponent(europeFlag)}`,
      });
    }

    data.push(pdfTitle);
  }

  const buffer = await generate('titles', app, data, pageTitle, orgId);

  res.set('Content-Type', 'application/pdf');
  res.set('Content-Length', buffer.length.toString());
  res.status(200).send(buffer);
  return;
};

async function generate(templateName: string, app: App, titles: PdfTitleData[], pageTitle: string, orgId?: string) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer'),
  ]);

  const htmlLogo = await getLogo(app, fs, path, orgId);

  const posterFallback = fs.readFileSync(path.resolve(`assets/images/empty_poster.svg`), 'utf8');
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');
  const data = {
    css,
    posterFallback: `data:image/svg+xml;utf8,${encodeURIComponent(posterFallback)}`,
    titles,
    pageTitle
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
  cssHeader.push(`header img {height: ${htmlLogo.height}; width: ${htmlLogo.width}}`);
  cssHeader.push('</style>');

  const pageHeight = (await page.evaluate(() => document.documentElement.offsetHeight)) + 240; // 240 = 100 + 40 margins
  const maxHeight = 6000;
  const height = pageHeight < maxHeight ? pageHeight : maxHeight;

  const pdf = await page.pdf({
    height,
    displayHeaderFooter: true,
    headerTemplate: `${cssHeader.join('')}<header class="header">${htmlLogo.tag}</header>`,
    footerTemplate: `<p></p>`, // If left empty, default is page number
    margin: {
      top: '100px',
      bottom: '40px',
    },
  });
  await browser.close();
  return pdf;
}
