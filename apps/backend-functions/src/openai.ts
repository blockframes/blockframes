import { getStorage } from '@blockframes/firebase-utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import PDFParser from 'pdf2json';
import 'openai/shims/node';
import OpenAI from 'openai';
import { openaiAPIKey, storageBucket } from './environments/environment';
import { ChatCompletionMessageParam } from 'openai/resources';
import { rightholderRoles } from '@blockframes/model';
import { AskContractData, AskContractParams, AskContractResponse, ExpectedResponse } from '@blockframes/utils/openai/utils';

/**
 * @see https://openai.com/api/pricing
 * @see https://platform.openai.com/usage
 */

const client = new OpenAI({ apiKey: openaiAPIKey });

export const askContractData = async (params: AskContractParams, context: CallableContext): Promise<AskContractResponse> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const bucket = getStorage().bucket(storageBucket);
  const filePath = `${params.file.privacy}/${params.file.storagePath}`;
  const fileObject = bucket.file(filePath);
  const [file] = await fileObject.download();

  const output = await parsePDF(file);

  let pages = [];
  if (pages.length === 0) pages = Object.keys(output).map(Number);
  pages = pages.slice(0, 30); // Limit to 30 pages

  /*for (const page of pages) {
    console.log(`---------- page ${page} START ----------\n`);
    console.log(output[page]);
    console.log(`-\n---------- page ${page} END ----------\n`);
  }*/

  const example: ExpectedResponse = {
    contractants: {
      vendeur: 'Truc prod',
      acheteur: 'France Télévision'
    },
    documentName: 'contrat de distribution',
    signatureDate: '2022-01-01',
    dateDebut: '2022-01-01',
    dateFin: '2022-12-31'
  }

  const director = params.movie.directors[0];

  const questionParts: string[] = [];

  if (params.type !== 'other') {
    questionParts.push(`Dans le contrat de type "${rightholderRoles[params.type]}" pour le film ("${params.movie.title.international}", réalisé par ${director.firstName}, ${director.lastName}) qui suit,`);
  } else {
    questionParts.push(`Dans le contrat pour le film ("${params.movie.title.international}", réalisé par ${director.firstName}, ${director.lastName}) qui suit,`);
  }

  questionParts.push("Effectue les taches suivantes:");

  if (params.rightholders.length) {
    questionParts.push(" 1 - identifier les contractants. Si tu ne trouves pas les contractants dans la liste ci-dessous, retourne les noms que tu as trouvés.");
    questionParts.push(`Voici une liste des parties prenantes du film : ${params.rightholders.map(r => `${r.name} (role: ${rightholderRoles[r.roles[0]]})`).join(', ')}. \n\n`);
  } else {
    questionParts.push(" 1 - identifier les contractants.");
  }

  if (!['agent', 'author'].includes(params.type)) questionParts.push('(Dans ce type de contrat, le producteur est toujours le vendeur.)');
  questionParts.push(" 2 - donner un nom au document.");
  questionParts.push(" 3 - identifier la date de signature.");
  questionParts.push(" 4 - identifier, si possible, la date de début du contrat.");
  questionParts.push(" 5 - identifier, si possible, la date de fin du contrat.");

  questionParts.push("Voilà un exemple de sortie attendue:");
  questionParts.push(JSON.stringify(example));
  questionParts.push("Le contrat est le suivant :");

  const question = questionParts.join(' ');

  const text = pages.map(p => output[p]).join(' ');

  if (text.length < 200) return { status: false, question, error: 'Error while parsing PDF file' };

  const prompt = `${question}\n\n  ${text}  \n\nRéponse:`;

  const { json, raw } = await queryOpenAI(prompt);

  const data: AskContractData = {
    licensee: { id: '', name: '' },
    licensor: { id: '', name: '' },
    name: ''
  };

  if (json.contractants?.vendeur) {
    data.licensor = {
      id: params.rightholders.find(r => r.name === json.contractants.vendeur)?.id,
      name: json.contractants.vendeur
    }
  }

  if (json.contractants?.acheteur) {
    data.licensee = {
      id: params.rightholders.find(r => r.name === json.contractants.acheteur)?.id,
      name: json.contractants.acheteur
    }
  }

  if (json.documentName) {
    data.name = json.documentName;
  }

  if (json.signatureDate) {
    const date = new Date(json.signatureDate).getTime();
    if (!isNaN(date)) data.signatureTimestamp = date;
  }

  if (json.dateDebut) {
    const date = new Date(json.dateDebut).getTime();
    if (!isNaN(date)) data.startDateTimestamp = date;
  }

  if (json.dateFin) {
    const date = new Date(json.dateFin).getTime();
    if (!isNaN(date)) data.endDateTimestamp = date;
  }

  return { status: true, data, question, response: { raw, json } };
}

async function queryOpenAI(prompt: string): Promise<{ raw: string, json: ExpectedResponse }> {
  const message: ChatCompletionMessageParam = { role: 'user', content: prompt };
  const response = await client.chat.completions.create({ messages: [message], model: 'gpt-4-turbo-2024-04-09' });
  const raw = response.choices[0].message.content;

  let json: ExpectedResponse;
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}') + 1;
    const data = raw.substring(start, end);
    json = JSON.parse(data);
  } catch (error) {
    console.warn('Error parsing response', error);
  }

  return { raw, json };
}

function parsePDF(buffer: Buffer): Promise<string[]> {
  const pdfParser = new PDFParser(this, 1);
  const regex = /----------------Page \(\d+\) Break----------------/g;
  pdfParser.parseBuffer(buffer);

  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', errData => reject(errData));
    pdfParser.on('pdfParser_dataReady', () => {
      const text = (pdfParser as any).getRawTextContent();
      const pages: string[] = text.split(regex);
      resolve(pages);
    });
  });
}
