import { buildDeliveryPDF } from '../pdf';
import * as fs from 'fs';

const testData = {
  txID: {
    id1: '0x9e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8',
    id2: '0x8e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8',
    id3: '0x7e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8'
  },
  stakeholders: {
    id1: { name: 'John Doe', organization: 'LogicalPicture' },
    id2: { name: 'Tomme Hardy', organization: '20Th Century Fox' },
    id3: { name: 'Francis Munster', organization: 'Disney' }
  },
  steps: {
    i36vwU1eVdlNObEafOre: { name: 'A', date: new Date() },
    P8uVlb5CD0i6NU8fegAf: { name: 'B', date: new Date() }
  },
  materials: [
    {
      value: 'My Second Material',
      category: 'Some Category',
      id: '0DL3qyDacTcsyIQUCU0R',
      description: 'My Second Material Description',
      stepId: 'i36vwU1eVdlNObEafOre'
    },
    {
      value: 'My Third Material',
      category: 'Another Category',
      id: 'Ci3RPg5qLLNTo1e5n7L0',
      description: 'My Third Material Description',
      stepId: 'i36vwU1eVdlNObEafOre'
    },
    {
      description: 'Yet Another Material With a Description',
      stepId: 'P8uVlb5CD0i6NU8fegAf',
      value: 'Yet Another Material',
      category: 'Another Category',
      id: 'OtTFuS6Lq3MdjfGicU8v'
    },
    {
      description: 'My Material No Step Description',
      stepId: '',
      value: 'My Material No Step',
      category: 'Another Category',
      id: 'byVmOtNzxPNJZv8qs1OX'
    },
    {
      description: 'My Material Description',
      stepId: 'i36vwU1eVdlNObEafOre',
      value: 'My Material',
      category: 'Some Category',
      id: 'jYpavkTXisbfGfQT873I'
    }
  ]
};

function main() {
  const pdf = buildDeliveryPDF(testData);

  pdf.pipe(fs.createWriteStream('/tmp/delivery.pdf'));
  pdf.end();
}

main();
