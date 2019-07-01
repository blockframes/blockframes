/**
 * Deals with PDF exports for various parts of the application.
 */
import { groupBy, sortBy } from 'lodash';

const PdfPrinter = require('pdfmake');

interface StakeHolder {
  name: string;
  organization: string;
}

interface Step {
  name: string;
  date: Date;
}

interface Material {
  value: string;
  category: string;
  description: string;
  id: string;
  stepId: string;
}

interface DeliveryContent {
  txID: { [stakeholderID: string]: string };
  stakeholders: { [stakeholderID: string]: StakeHolder };
  steps: { [id: string]: Step };
  materials: Material[];
}

const FONTS = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const HEADER = 'header';
const SUBHEADER = 'subheader';
const DESCRIPTION = 'description';
const BOLD = 'bold';

const withStyle = (text: string, style: string): any => ({
  text,
  style
});

const header = (text: string) => withStyle(text, HEADER);
const subHeader = (text: string) => withStyle(text, SUBHEADER);
const description = (text: string) => withStyle(text, DESCRIPTION);
const bold = (text: string) => withStyle(text, BOLD);

const center = (content: string | { [k: string]: any }): any => {
  if (typeof content === typeof 'string') {
    return { text: content, alignment: 'center' };
  } else {
    // @ts-ignore: TODO: debug this switch
    return { ...content, alignment: 'center' };
  }
};

export function buildDeliveryPDF({ txID, stakeholders, materials, steps }: DeliveryContent) {
  // We store keys first to make sure order is preserved along the way
  const stakeholdersId = Object.keys(stakeholders);
  const stakeholdersHeader: any = stakeholdersId.map((id: string) => {
    const stakeholder = stakeholders[id];
    return [subHeader(stakeholder.name), description(stakeholder.organization)];
  });

  const materialsPerCategory = groupBy(materials, (material: Material) => material.category);
  const categories = sortBy(Object.keys(materialsPerCategory));

  const tables: any = [];
  categories.forEach(category => {
    // NOTE: pdfmake side-effect over the data provided, we can reuse the same objects
    // multiple time, we have to keep this variable definition INSIDE the forEach.
    const tableHeader = [bold('material'), center(bold('step'))];

    tables.push(subHeader(category));

    const tableBody = materialsPerCategory[category].map(material => [
      [bold(material.value), description(material.description)],
      center({
        text: material.stepId ? steps[material.stepId].name : '',
        margin: [0, 4, 0, 0]
      })
    ]);

    tables.push({
      style: 'materialsTable',
      table: {
        headerRows: 1,
        widths: ['80%', '20%'],
        body: [[...tableHeader], ...tableBody]
      }
    });
  });

  const signatures = {
    alignment: 'center',
    columns: stakeholdersId.map((id: string) => {
      const stakeholder = stakeholders[id];
      const tx = txID[id];

      return [bold(stakeholder.name), { qr: tx, fit: '100' }];
    })
  };

  //const materials: any = materials.map((x: any) => ['A', x.name, '20 July 2019']);

  const docDefinition = {
    styles: {
      materialsTable: {
        margin: [5, 5, 5, 5]
      },
      [HEADER]: {
        fontSize: 18,
        bold: true,
        margin: [5, 20, 5, 5]
      },
      [SUBHEADER]: {
        fontSize: 14,
        bold: true,
        margin: [5, 10, 5, 5]
      },
      [DESCRIPTION]: {
        fontSize: 10,
        italics: true
      },
      [BOLD]: {
        bold: true
      }
    },
    content: [
      header('Stakeholders'),
      {
        alignment: 'center',
        columns: stakeholdersHeader
      },
      header('Materials'),
      ...tables,
      header('Signatures'),
      signatures
    ],
    defaultStyle: {
      font: 'Helvetica'
    }
  };
  const printer = new PdfPrinter(FONTS);
  return printer.createPdfKitDocument(docDefinition);
}
