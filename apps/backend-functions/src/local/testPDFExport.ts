import { buildDeliveryPDF } from '../internals/pdf';
import * as fs from 'fs';
import { OrganizationStatus, MaterialStatus, createOrganizationDocument } from '../data/types';

const testData = {
  txID: {
    id1: '0x9e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8',
    id2: '0x8e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8',
    id3: '0x7e91a0b95412093e639189a05a2dbf68e16c3062001e673826616222baffcac8'
  },
  orgs: {
    id1: createOrganizationDocument({
      name: 'John Doe',
      officeAddress: 'LogicalPicture', // here #1126
      userIds: [],
      id: '',
      movieIds: [],
      status: OrganizationStatus.accepted
    }),
    id2: createOrganizationDocument({
      name: 'Tomme Hardy',
      officeAddress: '20Th Century Fox', // here #1126
      userIds: [],
      id: '',
      movieIds: [],
      status: OrganizationStatus.accepted
    }),
    id3: createOrganizationDocument({
      name: 'Francis Munster',
      officeAddress: 'Disney', // here #1126
      userIds: [],
      id: '',
      movieIds: [],
      status: OrganizationStatus.accepted
    })
  },
  steps: {
    i36vwU1eVdlNObEafOre: { id: '', name: 'A', date: new Date() },
    P8uVlb5CD0i6NU8fegAf: { id: '', name: 'B', date: new Date() }
  },
  materials: [
    {
      deliveryIds: [],
      status: MaterialStatus.pending,
      value: 'My Second Material',
      category: 'Some Category',
      id: '0DL3qyDacTcsyIQUCU0R',
      description: 'My Second Material Description',
      stepId: 'i36vwU1eVdlNObEafOre'
    },
    {
      deliveryIds: [],
      status: MaterialStatus.pending,
      value: 'My Third Material',
      category: 'Another Category',
      id: 'Ci3RPg5qLLNTo1e5n7L0',
      description: 'My Third Material Description',
      stepId: 'i36vwU1eVdlNObEafOre'
    },
    {
      deliveryIds: [],
      status: MaterialStatus.available,
      description: 'Yet Another Material With a Description',
      stepId: 'P8uVlb5CD0i6NU8fegAf',
      value: 'Yet Another Material',
      category: 'Another Category',
      id: 'OtTFuS6Lq3MdjfGicU8v'
    },
    {
      deliveryIds: [],
      status: MaterialStatus.pending,
      description: 'My Material No Step Description',
      stepId: '',
      value: 'My Material No Step',
      category: 'Another Category',
      id: 'byVmOtNzxPNJZv8qs1OX'
    },
    {
      deliveryIds: [],
      status: MaterialStatus.delivered,
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
