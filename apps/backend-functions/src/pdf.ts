/**
 * Deals with PDF exports for various parts of the application.
 */
const PdfPrinter = require('pdfmake');

type DeliveryContent = any;

const FONTS = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

export function buildDeliveryPDF(content: DeliveryContent) {
  let header: any = content.stakeholders.map((x: any) => [
    { text: x.name },
    { text: x.organization }
  ]);

  if (content.txID) {
    header = [{ qr: content.txID }, ...header];
  }

  const materials: any = content.materials.map((x: any) => ['A', x.name, '20 July 2019']);

  const docDefinition = {
    styles: {
      materialsTable: {
        margin: [5, 5, 5, 5]
      },
      header: {
        fontSize: 18,
        bold: true
      }
    },
    content: [
      { text: 'Stakeholders', style: 'header' },
      {
        alignment: 'justify',
        columns: header
      },
      { text: 'Materials', style: 'header' },
      {
        style: 'materialsTable',
        table: {
          headerRows: 1,
          widths: [40, '*', 140],
          body: [['A', 'Name', 'Due Date'], ...materials]
        }
      }
    ],
    defaultStyle: {
      font: 'Helvetica'
    }
  };
  const printer = new PdfPrinter(FONTS);
  return printer.createPdfKitDocument(docDefinition);
}
