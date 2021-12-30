
import { FullMandate, FullSale, territoryAvailabilities } from '../new-avails';
import { availDetailsExclusive } from './../fixtures/availsFilters';
import { BucketContract } from '@blockframes/contract/bucket/+state';

describe('Test territoryAvailabilities pure function', () => {

  it('territoryAvailabilities', () => {
    const mandate = {
      titleId: 'titleA',
      id: 'mandateA',
      termIds: ['termA'],
      terms: [{
        id: 'termA',
        contractId: 'mandateA',
        duration: {
          from: new Date('01/01/2020'),
          to: new Date('01/01/2030')
        },
        medias: ['theatrical'],
        territories: ['france', 'germany', 'greece'],
        exclusive: true
      }],
    } as FullMandate;

    const sale = {
      titleId: 'titleA',
      id: 'saleA',
      termIds: ['termB'],
      terms: [{
        id: 'termB',
        contractId: 'saleA',
        duration: {
          from: new Date('01/01/2020'),
          to: new Date('01/01/2030')
        },
        medias: ['theatrical'],
        territories: ['germany'],
        exclusive: true
      }],
    } as FullSale;

    const bucket = {
      orgId: '',
      price: 0,
      parentTermId: 'mandateA',
      specificity: '',
      holdbacks: [],
      titleId: 'titleA',
      terms: [{
        duration: {
          from: new Date('06/01/2021'),
          to: new Date('12/01/2021')
        },
        medias: ['theatrical'],
        territories: ['greece'],
        exclusive: true
      }],
    } as BucketContract;

    const available = territoryAvailabilities(availDetailsExclusive, [mandate], [sale], [bucket]);

    expect(available.available.length).toBe(1);
    expect(available.available[0].slug).toBe('france');
    expect(available.available[0].contract.id).toBe('mandateA');

    expect(available.sold.length).toBe(1);
    expect(available.sold[0].slug).toBe('germany');
    expect(available.sold[0].contract.id).toBe('saleA');

    expect(available.selected.length).toBe(1);
    expect(available.selected[0].slug).toBe('greece');
  });
});

