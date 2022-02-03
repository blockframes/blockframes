
import { BucketContract } from '@blockframes/contract/bucket/+state';

import {
  availDetailsExclusive, availSouthKorea, availAfghanistan,
  availFrance, availsSVODArgentina, availsPayTVArgentina,
  availsGermany, availsBerlgium, availsExistingEndedSales,
  availsOngoingSales, availsTerritoryWithExclusivity, availsTerritoryWithoutExclusivity,
  availsFranceLuxembourg,availsAllButSouthKorea,
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
    const markers = territoryAvailabilities(availSouthKorea, [mandateMovie1], sales, []);
    expect(markers.notLicensed.length).toBe(1);
    expect(markers.notLicensed?.[0]?.slug).toBe('south-korea');
  })

  it.skip('Check not licensed due to duration', () => {
    const markers = territoryAvailabilities(availAfghanistan, [mandateMovie1], sales, []);
    const notLicensedTerritories = markers.notLicensed.map(s => s.slug)
    expect(notLicensedTerritories).toContain('afghanistan');
  })

  it.skip('Check not licensed due to media', () => {
    const markers = territoryAvailabilities(availFrance, [mandateMovie1], sales, []);
    const notLicensedTerritories = markers.notLicensed.map(s => s.slug)
    expect(notLicensedTerritories).toContain('france');
  })

  it.skip('Check available  on terms with existing ended sales', () => {
    const markers = territoryAvailabilities(availsExistingEndedSales, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(marker => marker.slug)
    expect(availableTerritories).toContain('germany',);
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  })

  it.skip('Check not licensed due to terms with ongoing sales.', () => {
    const markers = territoryAvailabilities(availsOngoingSales, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(marker => marker.slug)
    const soldTerritories = markers.sold.map(marker => marker.slug)
    expect(soldTerritories).toContain('germany',);
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  })

  it.skip('Check available non exclusive', () => {
    const markers = territoryAvailabilities(availsTerritoryWithoutExclusivity, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(marker => marker.slug)
    expect(availableTerritories).toContain('germany',);
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  })

  it.skip('Check not licensed due to territory and exclusivity', () => {
    const markers = territoryAvailabilities(availsTerritoryWithExclusivity, [mandateMovie1], sales, []);
    const soldTerritories = markers.sold.map(marker => marker.slug)
    const availableTerritories = markers.available.map(marker => marker.slug)
    expect(soldTerritories).toContain('germany',);
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  })

  it.skip('Check terms available', () => {
    const markers = territoryAvailabilities(availsSVODArgentina, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(s => s.slug)
    expect(availableTerritories).toContain('argentina');
  })

  it.skip('Check term sold', () => {
    const markers = territoryAvailabilities(availsPayTVArgentina, [mandateMovie1], sales, []);
    const soldTerritories = markers.sold.map(s => s.slug)
    expect(markers.sold.length).toBeGreaterThan(0);
    expect(soldTerritories).toContain('argentina');
  })

  it.skip('Check available non exclusivity', () => {
    const markers = territoryAvailabilities(availsGermany, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(s => s.slug)
    expect(markers.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('germany');
  })

  it.skip('Check available terms with existing future sales', () => {
    const markers = territoryAvailabilities(availsBerlgium, [mandateMovie1], sales, []);
    const availableTerritories = markers.available.map(s => s.slug)
    expect(markers.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('belgium');
  })

  it.skip('Check not available due to terms with existing future sales', () => {
    const markers = territoryAvailabilities(availsFranceLuxembourg, [mandateMovie1], sales, []);
    const soldTerritories = markers.sold.map(s => s.slug)
    expect(soldTerritories).toContain('france');
    expect(soldTerritories).toContain('luxembourg');
  })

  it.skip('Check available on several Media + Last day of mandate', () => {
    const markers = territoryAvailabilities(availsAllButSouthKorea, [mandateMovie1], sales, []);
    expect(markers.sold.length).toBe(0);
    expect(markers.inBucket.length).toBe(0);
    expect(markers.selected.length).toBe(0);
    expect(markers.notLicensed.length).toBe(1);
    expect(markers.notLicensed?.[0]?.slug).toBe('south-korea');
  })

})
