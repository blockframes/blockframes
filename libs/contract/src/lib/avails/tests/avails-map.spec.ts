
import { BucketContract } from '@blockframes/contract/bucket/+state';

import {
  availDetailsExclusive, availSouthKorea, availAfghanistan,
  availFrance, availsSVODArgentina, availsPayTVArgentina,
  availsGermany, availsBerlgium,
} from './../fixtures/availsFilters';
import {
  mandateMovie1, sale1Movie1, sale2Movie1, sale3Movie1, sale4Movie1,
} from './../fixtures/mandatesAndSales';
import { FullMandate, FullSale, territoryAvailabilities } from '../avails';

const sales = [sale1Movie1, sale2Movie1, sale3Movie1, sale4Movie1]


describe.skip('Test territoryAvailabilities pure function', () => {

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


describe('Test terms are out of movie mandate', () => {
  it.skip('Checks not licensed due to territory', () => {
    const available = territoryAvailabilities(availSouthKorea, [mandateMovie1], sales, []);
    expect(available.notLicensed.length).toBe(1);
    expect(available.notLicensed?.[0]?.slug).toBe('south-korea');
  })

  it.skip('Check not licensed due to duration', () => {
    const available = territoryAvailabilities(availAfghanistan, [mandateMovie1], sales, []);
    const notLicensedTerritories = available.notLicensed.map(s => s.slug)
    expect(notLicensedTerritories).toContain('afghanistan');
  })

  it.skip('Check not licensed due to media', () => {
    const available = territoryAvailabilities(availFrance, [mandateMovie1], sales, []);
    const notLicensedTerritories = available.notLicensed.map(s => s.slug)
    expect(notLicensedTerritories).toContain('france');
  })

  it.skip('Check terms available', () => {
    const available = territoryAvailabilities(availsSVODArgentina, [mandateMovie1], sales, []);
    const availableTerritories = available.available.map(s => s.slug)
    expect(availableTerritories).toContain('argentina');
  })

  it.skip('Check term sold', () => {
    const available = territoryAvailabilities(availsPayTVArgentina, [mandateMovie1], sales, []);
    const soldTerritories = available.sold.map(s => s.slug)
    expect(available.sold.length).toBeGreaterThan(0);
    expect(soldTerritories).toContain('argentina');
  })

  it.skip('Check available non exclusivity', () => {
    const available = territoryAvailabilities(availsGermany, [mandateMovie1], sales, []);
    const availableTerritories = available.available.map(s => s.slug)
    expect(available.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('germany');
  })

  it('Check available terms with existing future sales', () => {
    const available = territoryAvailabilities(availsBerlgium, [mandateMovie1], sales, []);
    const availableTerritories = available.available.map(s => s.slug)
    expect(available.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('belgium');
  })
})
