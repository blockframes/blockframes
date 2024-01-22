import {
  Movie,
  MovieCurrency,
  PricePerCurrency,
  PublicUser,
  Statement,
  StatementPdfParams,
  StatementPdfRequest,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallRightholder,
  convertDocumentTo,
  convertStatementsTo,
  displayName,
  getStatementData,
  getUserEmailData,
  getWaterfallEmailData,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement,
  mainCurrency,
  smartJoin
} from '@blockframes/model';
import { Response } from 'firebase-functions';
import { gzipSync } from 'node:zlib';
import { getCollection, getDocument } from '@blockframes/firebase-utils';
import { toLabel } from '@blockframes/model';
import { format } from 'date-fns';
import { shareStatement } from './templates/mail';
import { groupIds } from '@blockframes/utils/emails/ids';
import { sendMailFromTemplate } from './internals/email';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';

export const statementToPdf = async (req: StatementPdfRequest, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const { statementId, waterfallId, number, versionId } = req.body;
  if (!statementId || !waterfallId || !versionId) {
    res.status(500).send();
    return;
  }

  const buffer = await _statementToPdf(statementId, waterfallId, number, versionId);

  const gzip = gzipSync(buffer);

  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Length', buffer.length.toString());
  res.status(200).send(gzip);
  return;
};

export const statementToEmail = async (data: { request: StatementPdfParams, emails: string[] }, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const { statementId, waterfallId, number, versionId } = data.request;
  if (!statementId || !waterfallId || !versionId) throw new Error('Permission denied: missing data.');

  const buffer = await _statementToPdf(statementId, waterfallId, number, versionId);
  await Promise.all(data.emails.map(email => sendMailWithEnclosedStatement(waterfallId, { email }, data.request.fileName, buffer)));
  return true;
};

async function _statementToPdf(statementId: string, waterfallId: string, number: number, versionId: string) {
  const _statements = await getCollection<Statement>(`waterfall/${waterfallId}/statements`);
  const waterfall = await getDocument<Waterfall>(`waterfall/${waterfallId}`);
  const movie = await getDocument<Movie>(`movies/${waterfall.id}`);
  const statements = convertStatementsTo(_statements, waterfall.versions.find(v => v.id === versionId));
  const statement = statements.find(s => s.id === statementId);
  const parentStatements = statements.filter(s => isDirectSalesStatement(s) || isDistributorStatement(s))
    .filter(s => s.payments.right.some(r => r.incomeIds.some(id => statement.incomeIds.includes(id))));
  let contract: WaterfallContract;
  if (statement.contractId) {
    const document = await getDocument<WaterfallDocument>(`waterfall/${waterfallId}/documents/${statement.contractId}`);
    contract = convertDocumentTo<WaterfallContract>(document);
  }

  return generate(
    'statement',
    movie,
    { ...statement, number },
    waterfall,
    waterfall.rightholders,
    isProducerStatement(statement) ? parentStatements : [],
    contract
  );
}

const getDirectors = (m: Movie) => {
  return smartJoin(m.directors.map(p => displayName(p).trim()).filter(p => p));
}

async function generate(
  templateName: string,
  movie: Movie,
  statement: (Statement & { number: number }),
  waterfall: Waterfall,
  rightholders: WaterfallRightholder[],
  _parentStatements: Statement[] = [],
  contract: WaterfallContract,
) {
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer'),
  ]);
  hb.registerHelper('eq', (a, b) => a === b);
  hb.registerHelper('pricePerCurrency', (price: PricePerCurrency) => {
    if (price.USD) return `${toLabel('USD', 'movieCurrenciesSymbols')} ${(Math.round(price.USD * 100) / 100).toFixed(2)}`;
    if (price.EUR) return `${toLabel('EUR', 'movieCurrenciesSymbols')} ${(Math.round(price.EUR * 100) / 100).toFixed(2)}`;
    return '€ O';
  });
  hb.registerHelper('formatPair', (price: number, currency: MovieCurrency) => {
    return `${toLabel(currency, 'movieCurrenciesSymbols')} ${(Math.round(price * 100) / 100).toFixed(2)}`;
  });
  hb.registerHelper('date', (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  });
  hb.registerHelper('expenseType', (typeId: string, contractId: string) => {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  });
  hb.registerHelper('rightholderName', (rightholderId: string) => {
    return rightholders.find(r => r.id === rightholderId)?.name || '--';
  });

  // Data
  const rightholderKey = statement.type === 'producer' ? 'receiverId' : 'senderId';
  const rightholder = rightholders.find(r => r.id === statement[rightholderKey]);
  const totalNetReceipt = statement.reportedData.sourcesBreakdown?.map(s => s.net).reduce((acc, curr) => {
    for (const currency of Object.keys(curr)) {
      acc[currency] = (acc[currency] || 0) + curr[currency];
    }
    return acc;
  }, {});
  const parentStatements = _parentStatements.map(stm => ({
    ...stm,
    sender: rightholders.find(r => r.id === stm.senderId).name,
    receiver: rightholders.find(r => r.id === stm.receiverId).name,
    totalNetReceipt: stm.reportedData.sourcesBreakdown.map(s => s.net).reduce((acc, curr) => {
      for (const currency of Object.keys(curr)) {
        acc[currency] = (acc[currency] || 0) + curr[currency];
      }
      return acc;
    }, {})
  }));

  // CSS
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');

  // Front page
  const pageTitle = `${toLabel(statement.type, 'statementType')} Statement #${statement.number}`;
  const appLogo = fs.readFileSync(path.resolve(`assets/logo/blockframes.svg`), 'utf8');
  const rightCorner = fs.readFileSync(path.resolve(`assets/images/corner-right.svg`), 'utf8');
  const leftCorner = fs.readFileSync(path.resolve(`assets/images/corner-left.svg`), 'utf8');

  const data = {
    css,
    pageTitle,
    images: {
      rightCorner: `data:image/svg+xml;utf8,${encodeURIComponent(rightCorner)}`,
      leftCorner: `data:image/svg+xml;utf8,${encodeURIComponent(leftCorner)}`,
      appLogo: `data:image/svg+xml;utf8,${encodeURIComponent(appLogo)}`,
    },
    data: {
      movie: {
        ...movie,
        directors: getDirectors(movie),
      },
      statement: {
        ...statement,
        sender: rightholders.find(r => r.id === statement.senderId).name,
        receiver: rightholders.find(r => r.id === statement.receiverId).name,
        totalNetReceipt,
      },
      contract,
      rightholder,
      parentStatements,
      mainCurrency
    }
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
  cssHeader.push('</style>');

  const height = 1122; // A4 page height in pixels

  const pdf = await page.pdf({
    height,
    displayHeaderFooter: true,
    headerTemplate: cssHeader.join(''),
    footerTemplate: `<p></p>`, // If left empty, default is page number
    margin: {
      top: '0px',
      bottom: '0px',
    },
  });
  await browser.close();
  return pdf;
}

/** Share a statement by email */
async function sendMailWithEnclosedStatement(waterfallId: string, recipient: Partial<PublicUser>, fileName: string, buffer: Buffer) {
  const movie = await getDocument<Movie>(`movies/${waterfallId}`);
  const template = shareStatement(
    getUserEmailData(recipient),
    getStatementData(fileName, buffer),
    getWaterfallEmailData(movie)
  );
  await sendMailFromTemplate(template, 'waterfall', groupIds.unsubscribeAll);
}
