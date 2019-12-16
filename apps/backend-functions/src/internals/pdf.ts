/**
 * Deals with PDF exports for various parts of the application.
 *
 * Designed to work both locally (for demo, testing & debugging)
 * and in a firebase function.
 */
import { groupBy, sortBy, isEmpty } from 'lodash';
import {
  asIDMap,
  DeliveryDocument,
  IDMap,
  MaterialDocument,
  OrganizationDocument,
  StepDocumentWithDate,
  convertStepDocumentToStepDocumentWithDate,
  StakeholderDocument
} from '../data/types';
import { getCollection, getDocument } from '../data/internals';

const PdfPrinter = require('pdfmake');

// Types
// =====

/**
 * Internal type expected by the pdf generation for delivery.
 */
interface DeliveryContent {
  txID: { [stakeholderID: string]: string };
  orgs: IDMap<OrganizationDocument>;
  steps: IDMap<StepDocumentWithDate>;
  materials: MaterialDocument[];
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

/**
 * Render a list of orgs / stakeholders
 *
 * This returns the PDFMake columns:
 * ```
 * ## Stakeholders
 *
 * | OrgName      | OrgName      | OrgName      | OrgName      |
 * | orgAddress   | orgAddress   | orgAddress   | orgAddress   |
 * ```
 *
 * The parameter orgIds is used to enforce a certain order.
 *
 * @param orgIds
 * @param orgs
 */
function rowOrganizations(orgIds: string[], orgs: IDMap<OrganizationDocument>): any {
  const columns: any = orgIds.map((id: string) => {
    const org = orgs[id];
    return [subHeader(org.denomination.full), description(`${org.addresses.main.street} ${org.addresses.main.zipCode} ${org.addresses.main.city} ${org.addresses.main.country}`)];
  });
  return [
    header('Stakeholders'),
    {
      alignment: 'center',
      columns
    }
  ];
}

/**
 * Render a list of material, assumes they are all in the same category.
 *
 * This returns the PDFMake table:
 * ```
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 * ```
 *
 * @param materials
 * @param steps
 */
function rowMaterials(
  materials: MaterialDocument[],
  steps: { [id: string]: StepDocumentWithDate }
): any {
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

/**
 * Render a list of materials, grouped by category.
 *
 * This returns the PDFMake list of tables:
 *
 * ```
 * ## Category1
 *
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 *
 * ## Category2
 *
 *    +---------------------------------------+------+
 *    | material value                        | step |
 *    | Material description                  |      |
 *    +---------------------------------------+------+
 * ```
 *
 * @param materials
 * @param steps
 */
function rowMaterialsPerCategory(
  materials: MaterialDocument[],
  steps: { [id: string]: StepDocumentWithDate }
): any {
  const materialsPerCategory = groupBy(
    materials,
    (material: MaterialDocument) => material.category
  );
  const categories = sortBy(Object.keys(materialsPerCategory));

  const tables: any[] = [];

  categories.forEach(category => {
    tables.push(subHeader(category));
    tables.push(rowMaterials(materialsPerCategory[category], steps));
  });

  return [header('Materials'), ...tables];
}

/**
 * Render a list of orgs' transactions ids as QR codes
 *
 * This returns the PDFMake columns:
 * ```
 * ## Signatures
 *
 * | OrgName      | OrgName      | OrgName      | OrgName      |
 * | ▒ tx QR Code | ▒ tx QR Code | ▒ tx QR Code | ▒ tx QR Code |
 * ```
 *
 * The parameter orgIds is used to enforce a certain order.

 *
 * @param organizationIds
 * @param organizations
 * @param txID
 */
function rowSignatures(
  organizationIds: string[],
  organizations: { [id: string]: OrganizationDocument },
  txID: { [orgId: string]: string }
): any {
  if (isEmpty(txID)) {
    return [];
  }

  const columns = organizationIds.map((id: string) => {
    const stakeholder = organizations[id];
    const tx = txID[id];

    return [bold(stakeholder.denomination.full), { qr: tx, fit: '100' }];
  });

  return [
    header('Signatures'),
    {
      alignment: 'center',
      columns
    }
  ];
}

/**
 * Render a delivery, its stakeholders, transactions and materials into a PDF document.
 *
 * @param txID
 * @param orgs
 * @param materials
 * @param steps
 */
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

/**
 * Handle firebase requests to generate the PDF of a delivery.
 *
 * Wrapper around buildDeliveryPDF,
 * handles firebase request, loads the delivery data from firestore
 * and pipe the PDF to the express response.
 *
 * @param req   express requests, expects `deliveryId` in the query parameters.
 * @param resp  express response, we will feed it with the pdf content.
 */
export async function onGenerateDeliveryPDFRequest(req: any, resp: any) {
  const deliveryId: string = req.query.deliveryId;

  // TODO: factor out the data layer
  const delivery = await getDocument<DeliveryDocument>(`deliveries/${deliveryId}`);
  const stakeholders = await getCollection<StakeholderDocument>(
    `deliveries/${deliveryId}/stakeholders`
  );

  const orgs = await Promise.all(
    stakeholders.map(({ orgId }) => getDocument<OrganizationDocument>(`orgs/${orgId}`)) 
  );

  const materials = await getCollection<MaterialDocument>(`deliveries/${deliveryId}/materials`);

  const steps = asIDMap(convertStepDocumentToStepDocumentWithDate(delivery.steps));

  const pdf = buildDeliveryPDF({ orgs: asIDMap(orgs), materials, steps, txID: {} });
  pdf.pipe(resp);
  pdf.end();
}
