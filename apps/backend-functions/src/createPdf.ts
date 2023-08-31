import { festival, App, Movie, smartJoin, displayName, Organization, appName, PdfParamsFilters, PdfRequest } from '@blockframes/model';
import { toLabel } from '@blockframes/model';
import { Response } from 'firebase-functions';
import { applicationUrl } from '@blockframes/utils/apps';
import { getImgIxResourceUrl } from '@blockframes/media/image/directives/imgix-helpers';
import { getDocument, getStorage } from '@blockframes/firebase-utils';
import { storageBucket } from './environments/environment';
import { gzipSync } from 'node:zlib';

interface PdfTitleData {
  title: string;
  contentType: string;
  genres: string;
  releaseYear: number;
  episodeCount: number;
  originCountries: string;
  format: string;
  rating: string;
  runningTime: number;
  synopsis: string;
  posterUrl: string;
  cast: string;
  directors: string;
  version: {
    original: string;
    isOriginalVersionAvailable: boolean;
    subtitles: string;
    dubs: string;
  };
  links: {
    title: string;
    trailer: string;
    publicScreener: string;
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

const getCast = (m: Movie) => {
  return smartJoin(m.cast.slice(0, 3).map(p => displayName(p).trim()).filter(p => p));
}

const getDirectors = (m: Movie) => {
  return smartJoin(m.directors.map(p => displayName(p).trim()).filter(p => p));
}

const getRating = (m: Movie) => {
  const ratings = m.rating.map(r => {
    const country = r.country ? ` (${toLabel(r.country, 'territories')})` : '';
    return `${r.value}${country}`;
  });

  return smartJoin(ratings);
}

const getLogo = async (app: App, fs: any, path: any, org: Organization) => {
  if (org) {
    const { logo } = org;

    try {
      if (logo.storagePath) {
        const bucket = getStorage().bucket(storageBucket);
        const filePath = `${logo.privacy}/${logo.storagePath}`;
        const fileObject = bucket.file(filePath);
        const [image] = await fileObject.download();

        return {
          tag: `<img src="data:image/webp;base64,${image.toString('base64')}">`,
          width: '48px',
          height: '48px'
        }
      }
    } catch (_) {
      console.warn(`${org.id} logo not found`);
    }

  } else {
    const logo = fs.readFileSync(path.resolve(`assets/logo/${appLogo[app]}`), 'utf8');
    return {
      tag: `<img src="data:image/svg+xml;utf8,${encodeURIComponent(logo)}">`,
      width: '144px',
      height: '48px'
    };
  }
}

const getTitleLink = (m: Movie, urlBase: string) => {
  return `${urlBase}${m.id}`;
}

const getTrailerLink = (m: Movie, urlBase: string) => {
  const hasTrailer = m.promotional?.videos?.otherVideo?.jwPlayerId && m.promotional?.videos?.otherVideo?.privacy === 'public';
  if (!hasTrailer) return '';
  return `${urlBase}${m.id}/main#trailer`;
}

const getPublicScreenerLink = (m: Movie, app: App, urlBase: string) => {
  const hasPublicScreener = app === 'catalog' && !!m.promotional?.videos?.publicScreener?.jwPlayerId;
  if (!hasPublicScreener) return '';
  return `${urlBase}${m.id}/main#trailer`;
}

const getAvailsLink = (m: Movie, app: App, urlBase: string, formValue: string) => {
  if (app !== 'catalog') return '';
  return `${urlBase}${m.id}/avails/map${!formValue ? '' : `?formValue=${formValue}`}`;
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

  const { titleIds, app, orgId, filters } = req.body;
  if (!titleIds || !app) {
    res.status(500).send();
    return;
  }

  const promises = titleIds.map((id) => getDocument<Movie>(`movies/${id}`));
  const docs = await Promise.all(promises);
  const titles = docs.filter((m) => !!m);

  const [fs, path] = await Promise.all([import('fs'), import('path')]);

  const europeFlag = fs.readFileSync(path.resolve(`assets/images/europe.png`), 'base64');
  const franceFlag = fs.readFileSync(path.resolve(`assets/images/france.png`), 'base64');

  const data: PdfTitleData[] = [];

  const appUrl = applicationUrl[app];
  const urlBase = `${appUrl}/c/o/marketplace/title/`;

  for (const m of titles) {

    const pdfTitle: PdfTitleData = {
      title: m.title.international,
      contentType: toLabel(m.contentType, 'contentType'),
      genres: getGenres(m),
      releaseYear: m.release.year,
      episodeCount: m.runningTime.episodeCount,
      originCountries: toLabel(m.originCountries, 'territories'),
      format: toLabel(m.format, 'movieFormat'),
      rating: getRating(m),
      runningTime: m.runningTime.time,
      synopsis: m.synopsis,
      posterUrl: m.poster?.storagePath ? getImgIxResourceUrl(m.poster, { h: 240, w: 180 }) : '',
      cast: getCast(m),
      directors: getDirectors(m),
      version: {
        original: toLabel(m.originalLanguages, 'languages', ', ', ' & '),
        isOriginalVersionAvailable: m.isOriginalVersionAvailable,
        subtitles: getSubs(m),
        dubs: getDubs(m),
      },
      links: {
        title: getTitleLink(m, urlBase),
        trailer: getTrailerLink(m, urlBase),
        publicScreener: getPublicScreenerLink(m, app, urlBase),
        avails: getAvailsLink(m, app, urlBase, filters?.availsFormValue),
      },
      prizes: getPrizes(m),
      certifications: []
    };

    if (m.certifications.some(c => c === 'eof')) {
      pdfTitle.certifications.push({
        desc: toLabel('eof', 'certifications'),
        flag: `data:image/png;base64,${encodeURIComponent(franceFlag)}`,
      });
    }

    if (m.certifications.some(c => c === 'europeanQualification')) {
      pdfTitle.certifications.push({
        desc: toLabel('europeanQualification', 'certifications'),
        flag: `data:image/png;base64,${encodeURIComponent(europeFlag)}`,
      });
    }

    data.push(pdfTitle);
  }

  const buffer = await generate('titles', app, data, filters, orgId);

  /**
   * Firebase functions only allow a max size of 10mb for http requests
   * @see https://firebase.google.com/docs/functions/quotas#resource_limits
   * So we try to compress it but if gzip size is > 10mb, function will fail
   */
  const gzip = gzipSync(buffer);

  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Length', buffer.length.toString());
  res.status(200).send(gzip);
  return;
};

async function generate(templateName: string, app: App, titles: PdfTitleData[], filters: PdfParamsFilters, orgId?: string) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer'),
  ]);

  const org = orgId ? await getDocument<Organization>(`orgs/${orgId}`) : undefined;
  const pageTitle = org ? `${org.name} Library` : `${appName[app]} Library`;

  const htmlLogo = await getLogo(app, fs, path, org);

  const posterFallback = fs.readFileSync(path.resolve(`assets/images/empty_poster.svg`), 'utf8');
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');
  const data = {
    css,
    posterFallback: `data:image/svg+xml;utf8,${encodeURIComponent(posterFallback)}`,
    titles,
    pageTitle,
    haveFilters: !!filters?.contentType || !!filters?.genres || !!filters?.originCountries || !!filters?.avails,
    filters
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
  if (htmlLogo) cssHeader.push(`header img {height: ${htmlLogo.height}; width: ${htmlLogo.width}}`);
  cssHeader.push('</style>');

  const pageHeight = (await page.evaluate(() => document.documentElement.offsetHeight)) + 240; // 240 = 100 + 40 margins
  const maxHeight = 6000;
  const height = pageHeight < maxHeight ? pageHeight : maxHeight;

  const pdf = await page.pdf({
    height,
    displayHeaderFooter: true,
    headerTemplate: htmlLogo ? `${cssHeader.join('')}<header class="header">${htmlLogo.tag}</header>` : cssHeader.join(''),
    footerTemplate: `<p></p>`, // If left empty, default is page number
    margin: {
      top: '100px',
      bottom: '40px',
    },
  });
  await browser.close();
  return pdf;
}
