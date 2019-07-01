import { buildDeliveryPDF } from '../pdf';
import * as fs from 'fs';

const testData = {
  txID: ['0x9e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8'],
  stakeholders: [
    { name: 'John Doe', organization: 'LogicalPicture' },
    { name: 'Tomme Hardy', organization: '20Th Century Fox' },
    { name: 'Francis Munster', organization: 'Disney' }
  ],
  materials: [
    {
      name: 'Version Originale'
    },
    {
      name: 'Subtitles FR'
    }
  ]
};

function main() {
  const pdf = buildDeliveryPDF(testData);

  pdf.pipe(fs.createWriteStream('/tmp/delivery.pdf'));
  pdf.end();
}

main();
