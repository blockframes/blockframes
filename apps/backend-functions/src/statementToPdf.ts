import {
  Movie,
  MovieCurrency,
  Organization,
  PricePerCurrency,
  PublicUser,
  Scope,
  Statement,
  StatementPdfParams,
  StatementPdfRequest,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallPermissions,
  convertDocumentTo,
  convertStatementsTo,
  displayName,
  getOrgEmailData,
  getParentStatements,
  getStatementData,
  getUserEmailData,
  getWaterfallEmailData,
  isProducerStatement,
  mainCurrency,
  rightholderKey,
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
  if (!statementId || !waterfallId) {
    res.status(500).send();
    return;
  }

  const waterfall = await getDocument<Waterfall>(`waterfall/${waterfallId}`);
  const movie = await getDocument<Movie>(`movies/${waterfall.id}`);
  const buffer = await _statementToPdf(statementId, waterfall, movie, number, versionId);

  const gzip = gzipSync(buffer);

  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Length', buffer.length.toString());
  res.status(200).send(gzip);
  return;
};

export const statementToEmail = async (data: { request: StatementPdfParams, emails: string[] }, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const { statementId, waterfallId, number, versionId, org } = data.request;
  if (!statementId || !waterfallId || !org) throw new Error('Permission denied: missing data.');

  const waterfall = await getDocument<Waterfall>(`waterfall/${waterfallId}`);
  const statement = await getDocument<Statement>(`waterfall/${waterfall.id}/statements/${statementId}`);
  const movie = await getDocument<Movie>(`movies/${waterfall.id}`);
  const buffer = await _statementToPdf(statementId, waterfall, movie, number, versionId);
  await Promise.all(data.emails.map(email => sendMailWithEnclosedStatement(statement, waterfall, org, movie, { email }, data.request.fileName, buffer)));
  return true;
};

async function _statementToPdf(statementId: string, waterfall: Waterfall, movie: Movie, number: number, versionId: string) {
  const _statements = await getCollection<Statement>(`waterfall/${waterfall.id}/statements`);
  const statements = convertStatementsTo(_statements, waterfall.versions.find(v => v.id === versionId));
  const statement = statements.find(s => s.id === statementId);
  const permissions = await getCollection<WaterfallPermissions>(`waterfall/${waterfall.id}/permissions`);
  const orgs = await Promise.all(permissions.map(p => getDocument<Organization>(`orgs/${p.id}`)));

  const rightholderOrgs = waterfall.rightholders.map(r => {
    const orgId = permissions.find(p => p.rightholderIds.includes(r.id))?.id;
    if (!orgId) return { rightholderId: r.id, org: null };
    return { rightholderId: r.id, org: orgs.find(o => o.id === orgId) };
  });
  const parentStatements = getParentStatements(statements, statement.incomeIds);
  let contract: WaterfallContract;
  if (statement.contractId) {
    const document = await getDocument<WaterfallDocument>(`waterfall/${waterfall.id}/documents/${statement.contractId}`);
    contract = convertDocumentTo<WaterfallContract>(document);
  }

  return generate(
    'statement',
    movie,
    { ...statement, number },
    waterfall,
    isProducerStatement(statement) ? parentStatements : [],
    contract,
    rightholderOrgs
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
  _parentStatements: Statement[] = [],
  contract: WaterfallContract,
  rightholderOrgs: { rightholderId: string, org: Organization | null }[]
) {
  const rightholders = waterfall.rightholders;
  const [fs, hb, path, { default: puppeteer }] = await Promise.all([
    import('fs'),
    import('handlebars'),
    import('path'),
    import('puppeteer'),
  ]);
  hb.registerHelper('eq', (a, b) => a === b);
  hb.registerHelper('isLast', (index, array) => index === array.length - 1);
  hb.registerHelper('pricePerCurrency', (price: PricePerCurrency) => {
    if (price.USD) return `${toLabel('USD', 'movieCurrenciesSymbols')} ${(Math.round(price.USD * 100) / 100).toFixed(2)}`;
    if (price.EUR) return `${toLabel('EUR', 'movieCurrenciesSymbols')} ${(Math.round(price.EUR * 100) / 100).toFixed(2)}`;
    return '€ O';
  });
  hb.registerHelper('formatPair', (price: number, currency: MovieCurrency) => {
    return `${toLabel(currency, 'movieCurrenciesSymbols')} ${(Math.round(price * 100) / 100).toFixed(2)}`;
  });
  hb.registerHelper('date', (date: Date) => {
    // @dev similar to toTimezone() function
    const tzDate = new Date(date.toLocaleString('en-us', { timeZone: 'Europe/Paris' }));
    return format(tzDate, 'dd/MM/yyyy');
  });
  hb.registerHelper('expenseType', (typeId: string, contractId: string) => {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  });
  hb.registerHelper('rightholderName', (rightholderId: string) => {
    return rightholders.find(r => r.id === rightholderId)?.name || '--';
  });
  hb.registerHelper('toLabel', (value: string, scope: Scope) => {
    return toLabel(value, scope);
  });
  hb.registerHelper('assign', (varName: string, varValue: string, options) => {
    if (!options.data.root) {
      options.data.root = {};
    }
    options.data.root[varName] = varValue;
  });

  // Data
  const rightholder = rightholders.find(r => r.id === statement[rightholderKey(statement.type)]);
  const totalNetReceipt = statement.reportedData.sourcesBreakdown?.map(s => s.net).reduce((acc, curr) => {
    for (const currency of Object.keys(curr)) {
      acc[currency] = (acc[currency] || 0) + curr[currency];
    }
    return acc;
  }, {});
  const parentStatements = _parentStatements.map(stm => {
    const senderAddress = rightholderOrgs.find(r => r.rightholderId === stm.senderId)?.org?.addresses?.main;
    return {
      ...stm,
      sender: rightholders.find(r => r.id === stm.senderId).name,
      senderAddress: senderAddress?.country ? senderAddress : null,
      receiver: rightholders.find(r => r.id === stm.receiverId).name,
      totalNetReceipt: stm.reportedData.sourcesBreakdown.map(s => s.net).reduce((acc, curr) => {
        for (const currency of Object.keys(curr)) {
          acc[currency] = (acc[currency] || 0) + curr[currency];
        }
        return acc;
      }, {})
    };
  });

  let showCalculationDetails = false;
  const parentSenderIds = parentStatements.map(stm => stm.senderId);
  for (const senderId of parentSenderIds) {
    if (parentStatements.filter(s => s.senderId === senderId).length > 1) {
      showCalculationDetails = true;
      break;
    }
  }

  // CSS
  const css = fs.readFileSync(path.resolve(`assets/style/${templateName}.css`), 'utf8');

  // Front page
  const pageTitle = `${toLabel(statement.type, 'statementType')} Statement #${statement.number}`;
  const appLogo = fs.readFileSync(path.resolve(`assets/logo/blockframes.svg`), 'utf8');
  const rightCorner = fs.readFileSync(path.resolve(`assets/images/corner-right.svg`), 'utf8');
  const leftCorner = fs.readFileSync(path.resolve(`assets/images/corner-left.svg`), 'utf8');

  const senderAddress = rightholderOrgs.find(r => r.rightholderId === statement.senderId)?.org?.addresses.main;
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
        senderAddress: senderAddress?.country ? senderAddress : null,
        receiver: rightholders.find(r => r.id === statement.receiverId).name,
        totalNetReceipt,
        reportedData: {
          ...statement.reportedData,
          details: showCalculationDetails ? statement.reportedData.details : undefined,
          expensesPerDistributor: showCalculationDetails ? statement.reportedData.expensesPerDistributor : undefined,
          distributorExpensesPerDistributor: showCalculationDetails ? statement.reportedData.distributorExpensesPerDistributor : undefined,
        }
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
      top: '12px',
      bottom: '12px',
    },
  });
  await browser.close();
  return pdf;
}

/** Share a statement by email */
async function sendMailWithEnclosedStatement(statement: Statement, waterfall: Waterfall, org: Organization, movie: Movie, recipient: Partial<PublicUser>, fileName: string, buffer: Buffer) {
  const template = shareStatement(
    getUserEmailData(recipient),
    getStatementData(statement, waterfall, fileName, buffer),
    getWaterfallEmailData(movie),
    getOrgEmailData(org),
  );
  await sendMailFromTemplate(template, 'waterfall', groupIds.unsubscribeAll);
}
