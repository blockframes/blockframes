/**
 * Deals with PDF exports for various parts of the application.
 */
import { groupBy, sortBy, isEmpty } from 'lodash';
import {
  asIDMap,
  Delivery,
  getCollection,
  getDocument,
  IDMap,
  Material,
  Organization,
  Stakeholder,
  Step
} from './utils';

const PdfPrinter = require('pdfmake');

// Types
// =====

interface DeliveryContent {
  txID: { [stakeholderID: string]: string };
  orgs: IDMap<Organization>;
  steps: IDMap<Step>;
  materials: Material[];
}

// Constants for styles & fonts
// ============================
const FONTS = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const STYLE_HEADER = 'header';
const STYLE_SUBHEADER = 'subheader';
const STYLE_DESCRIPTION = 'description';
const STYLE_BOLD = 'bold';
const STYLE_TABLE_MATERIALS = 'styleTableMaterials';

// Helpers
// -------

const withStyle = (text: string, style: string): any => ({
  text,
  style
});

const header = (text: string) => withStyle(text, STYLE_HEADER);
const subHeader = (text: string) => withStyle(text, STYLE_SUBHEADER);
const description = (text: string) => withStyle(text, STYLE_DESCRIPTION);
const bold = (text: string) => withStyle(text, STYLE_BOLD);

const center = (content: string | { [k: string]: any }): any => {
  if (typeof content === typeof 'string') {
    return { text: content, alignment: 'center' };
  } else {
    // @ts-ignore: TODO: debug this switch
    return { ...content, alignment: 'center' };
  }
};

// PDF Generation
// ==============

// These functions take our blockframes model and generate data the pdf rendering.

function rowOrganizations(orgIds: string[], orgs: IDMap<Organization>): any {
  const columns: any = orgIds.map((id: string) => {
    const org = orgs[id];
    return [subHeader(org.name), description(org.address)];
  });
  return [
    header('Stakeholders'),
    {
      alignment: 'center',
      columns
    }
  ];
}

function rowMaterials(materials: Material[], steps: { [id: string]: Step }): any {
  // NOTE: pdfmake side-effect over the data provided, we can reuse the same objects
  // multiple time, we have to keep this variable definition INSIDE the forEach.
  const tableHeader = [bold('material'), center(bold('step'))];

  const tableBody = materials.map(material => [
    [bold(material.value), description(material.description)],
    center({
      text: material.stepId ? steps[material.stepId].name : '',
      margin: [0, 4, 0, 0]
    })
  ]);

  return {
    style: STYLE_TABLE_MATERIALS,
    table: {
      headerRows: 1,
      widths: ['80%', '20%'],
      body: [[...tableHeader], ...tableBody]
    }
  };
}

function rowMaterialsPerCategory(materials: Material[], steps: { [id: string]: Step }): any {
  const materialsPerCategory = groupBy(materials, (material: Material) => material.category);
  const categories = sortBy(Object.keys(materialsPerCategory));

  const tables: any[] = [];

  categories.forEach(category => {
    tables.push(subHeader(category));
    tables.push(rowMaterials(materialsPerCategory[category], steps));
  });

  return [header('Materials'), ...tables];
}

function rowSignatures(
  organizationIds: string[],
  organizations: { [id: string]: Organization },
  txID: { [orgId: string]: string }
): any {
  if (isEmpty(txID)) {
    return [];
  }

  const columns = organizationIds.map((id: string) => {
    const stakeholder = organizations[id];
    const tx = txID[id];

    return [bold(stakeholder.name), { qr: tx, fit: '100' }];
  });

  return [
    header('Signatures'),
    {
      alignment: 'center',
      columns
    }
  ];
}

export function buildDeliveryPDF({ txID, orgs, materials, steps }: DeliveryContent) {
  // We store keys first to make sure order is preserved along the way
  const orgsIds = Object.keys(orgs);

  const docDefinition = {
    content: [
      ...rowOrganizations(orgsIds, orgs),
      ...rowMaterialsPerCategory(materials, steps),
      ...rowSignatures(orgsIds, orgs, txID)
    ],
    defaultStyle: {
      font: 'Helvetica'
    },
    styles: {
      [STYLE_TABLE_MATERIALS]: {
        margin: [5, 5, 5, 5]
      },
      [STYLE_HEADER]: {
        fontSize: 18,
        bold: true,
        margin: [5, 20, 5, 5]
      },
      [STYLE_SUBHEADER]: {
        fontSize: 14,
        bold: true,
        margin: [5, 10, 5, 5]
      },
      [STYLE_DESCRIPTION]: {
        fontSize: 10,
        italics: true
      },
      [STYLE_BOLD]: {
        bold: true
      }
    }
  };
  const printer = new PdfPrinter(FONTS);
  return printer.createPdfKitDocument(docDefinition);
}

export async function onGenerateDeliveryPDFRequest(req: any, resp: any) {
  const deliveryId: string = req.query.deliveryId;

  // TODO: factor out the data layer
  const delivery = await getDocument<Delivery>(`deliveries/${deliveryId}`);
  const stakeholders = await getCollection<Stakeholder>(`deliveries/${deliveryId}/stakeholders`)

  const orgs = await Promise.all(
    stakeholders.map(stk => getDocument<Organization>(`orgs/${stk.orgId}`))
  );

  const materials = await getCollection<Material>(`deliveries/${deliveryId}/materials`);
  const steps = asIDMap(delivery.steps);

  const pdf = buildDeliveryPDF({ orgs: asIDMap(orgs), materials, steps, txID: {} });
  pdf.pipe(resp);
  pdf.end();
}
