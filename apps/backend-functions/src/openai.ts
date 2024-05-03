import { getStorage } from '@blockframes/firebase-utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';
import { openaiAPIKey, storageBucket } from './environments/environment';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Movie, WaterfallFile, WaterfallRightholder } from '@blockframes/model';
import { AskContractData } from '@blockframes/utils/openai/utils';

const client = new OpenAI({ apiKey: openaiAPIKey });

interface ExpectedResponse {
  contractants: {
    vendeur: string,
    acheteur: string
  };
  documentName: string;
}

export const askContractData = async (data: { file: WaterfallFile, rightholders: WaterfallRightholder[], movie: Movie }, context: CallableContext) => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const bucket = getStorage().bucket(storageBucket);
  const filePath = `${data.file.privacy}/${data.file.storagePath}`;
  const fileObject = bucket.file(filePath);
  const [file] = await fileObject.download();

  const output = await parsePDF(file);

  let pages = [0, 1, 2, 3, 4, 5];
  if (pages.length === 0) pages = Object.keys(output).map(Number);

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
    documentName: 'contrat de distribution'
  }

  const director = data.movie.directors[0];
  const question = `Dans le contrat pour le film ("${data.movie.title.international}", réalisé par ${director.firstName}, ${director.lastName}) qui suit, ` +
    "quel est le nom des deux contractants, en précisant le nom de l'acheteur et le nom du vendeur ? " +
    `Voici une liste des parties prenantes du film : ${data.rightholders.map(r => `${r.name} (role ${r.roles[0]})`).join(', ')}. \n\n` +
    "Utilise cette liste pour identifier les contractants. Si tu ne trouves pas les contractants dans la liste, retourne les noms que tu as trouvés. " +
    "Donne aussi un nom au document." +
    "Voilà un exemple de sortie attendue (en json): \n\n" +
    `exemple : ${JSON.stringify(example)}  \n\n` +
    "Le contrat est le suivant  :";

  const text = pages.map(p => output[p]).join(' ');
  const prompt = `${question}\n\n  ${text}  \n\nRéponse:`;

  const promptResponse = await queryOpenAI(prompt);

  const response: AskContractData = {
    licensee: {
      id: '',
      name: '',
    },
    licensor: {
      id: '',
      name: '',
    },
    name: ''
  };

  if (promptResponse.contractants?.vendeur) {
    response.licensor = {
      id: data.rightholders.find(r => r.name === promptResponse.contractants.vendeur)?.id,
      name: promptResponse.contractants.vendeur
    }
  }

  if (promptResponse.contractants?.acheteur) {
    response.licensee = {
      id: data.rightholders.find(r => r.name === promptResponse.contractants.acheteur)?.id,
      name: promptResponse.contractants.acheteur
    }
  }

  if (promptResponse.documentName) {
    response.name = promptResponse.documentName;
  }

  return { response, question };
}

async function queryOpenAI(prompt: string): Promise<ExpectedResponse> {
  const message: ChatCompletionMessageParam = { role: 'user', content: prompt };
  const response = await client.chat.completions.create({ messages: [message], model: 'gpt-4' });

  console.log(`---------- response START ----------\n`);
  console.log(response.choices[0].message.content);
  console.log(`\n----------- response END ----------\n`);

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.warn('Error parsing response', error);
    console.warn(response.choices[0].message.content);
  }
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


