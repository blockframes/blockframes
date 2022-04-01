import { BucketContract } from '@blockframes/shared/model';
import {
  availDetailsExclusive,
  availSouthKorea,
  availAfghanistan,
  availFrance,
  availsSVODArgentina,
  availsPayTVArgentina,
  availsGermany,
  availsBelgium,
  availsExistingEndedSales,
  availsOngoingSales,
  availsTerritoryWithExclusivity,
  availsTerritoryWithoutExclusivity,
  availsFranceLuxembourg,
  availsAllButSouthKorea,
  availsPayTV,
  availsPlanes,
} from './../fixtures/availsFilters';
import {
  mandateMovie1,
  saleArgentinaMovie1,
  saleGermanyMovie1,
  saleCanadaMovie1,
  saleBelgiumFranceLuxembourgMovie1,
  mandateMovie6,
} from './../fixtures/mandatesAndSales';
import { FullMandate, FullSale, territoryAvailabilities } from '../avails';

const sales = [saleArgentinaMovie1, saleGermanyMovie1, saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1];

describe('Test territoryAvailabilities pure function', () => {
  it('territoryAvailabilities', () => {
    const mandate = {
      titleId: 'titleA',
      id: 'mandateA',
      termIds: ['termA'],
      terms: [
        {
          id: 'termA',
          contractId: 'mandateA',
          duration: {
            from: new Date('01/01/2020'),
            to: new Date('01/01/2030'),
          },
          medias: ['theatrical'],
          territories: ['france', 'germany', 'greece'],
          exclusive: true,
        },
      ],
    } as FullMandate;

    const sale = {
      titleId: 'titleA',
      id: 'saleA',
      termIds: ['termB'],
      terms: [
        {
          id: 'termB',
          contractId: 'saleA',
          duration: {
            from: new Date('01/01/2020'),
            to: new Date('01/01/2030'),
          },
          medias: ['theatrical'],
          territories: ['germany'],
          exclusive: true,
        },
      ],
    } as FullSale;

    const bucket = {
      orgId: '',
      price: 0,
      parentTermId: 'mandateA',
      specificity: '',
      holdbacks: [],
      titleId: 'titleA',
      terms: [
        {
          duration: {
            from: new Date('06/01/2021'),
            to: new Date('12/01/2021'),
          },
          medias: ['theatrical'],
          territories: ['greece'],
          exclusive: true,
        },
      ],
    } as BucketContract;

    const data = { avails: availDetailsExclusive, mandates: [mandate], sales: [sale], bucketContracts: [bucket] };
    const available = territoryAvailabilities(data);

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
  it('Checks not licensed due to territory', () => {
    const data = { avails: availSouthKorea, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    expect(markers.notLicensed.length).toBe(1);
    expect(markers.notLicensed?.[0]?.slug).toBe('south-korea');
  });

  it('Check not licensed due to duration', () => {
    const data = { avails: availAfghanistan, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const notLicensedTerritories = markers.notLicensed.map(s => s.slug);
    expect(notLicensedTerritories).toContain('afghanistan');
  });

  it('Check not licensed due to media', () => {
    const data = { avails: availFrance, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const notLicensedTerritories = markers.notLicensed.map(s => s.slug);
    expect(notLicensedTerritories).toContain('france');
  });

  it('Check available  on terms with existing ended sales', () => {
    const data = { avails: availsExistingEndedSales, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(marker => marker.slug);
    expect(availableTerritories).toContain('germany');
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  });

  it('Check not licensed due to terms with ongoing sales.', () => {
    const data = { avails: availsOngoingSales, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(marker => marker.slug);
    const soldTerritories = markers.sold.map(marker => marker.slug);
    expect(soldTerritories).toContain('germany');
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  });

  it('Check available due to non exclusive', () => {
    const data = { avails: availsTerritoryWithoutExclusivity, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(marker => marker.slug);
    expect(availableTerritories).toContain('germany');
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  });

  it('Check not licensed due to territory and exclusivity', () => {
    const data = { avails: availsTerritoryWithExclusivity, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const soldTerritories = markers.sold.map(marker => marker.slug);
    const availableTerritories = markers.available.map(marker => marker.slug);
    expect(soldTerritories).toContain('germany');
    expect(availableTerritories).toContain('russia');
    expect(availableTerritories).toContain('czech');
  });

  it('Check terms available', () => {
    const data = { avails: availsSVODArgentina, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(s => s.slug);
    expect(availableTerritories).toContain('argentina');
  });

  it('Check term sold', () => {
    const data = { avails: availsPayTVArgentina, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const soldTerritories = markers.sold.map(s => s.slug);
    expect(markers.sold.length).toBeGreaterThan(0);
    expect(soldTerritories).toContain('argentina');
  });

  it('Check available non exclusivity', () => {
    const data = { avails: availsGermany, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(s => s.slug);
    expect(markers.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('germany');
  });

  it('Check available terms with existing future sales', () => {
    const data = { avails: availsBelgium, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const availableTerritories = markers.available.map(s => s.slug);
    expect(markers.available.length).toBeGreaterThan(0);
    expect(availableTerritories).toContain('belgium');
  });

  it('Check not available due to terms with existing future sales', () => {
    const data = { avails: availsFranceLuxembourg, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    const soldTerritories = markers.sold.map(s => s.slug);
    expect(soldTerritories).toContain('france');
    expect(soldTerritories).toContain('luxembourg');
  });

  it('Check available on several Media + Last day of mandate', () => {
    const data = { avails: availsAllButSouthKorea, mandates: [mandateMovie1], sales, bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    expect(markers.sold.length).toBe(0);
    expect(markers.inBucket.length).toBe(0);
    expect(markers.selected.length).toBe(0);
    expect(markers.notLicensed.length).toBe(1);
    expect(markers.notLicensed?.[0]?.slug).toBe('south-korea');
  });

  it('Check non availability on china with payTv media', () => {
    const data = { avails: availsPayTV, mandates: [mandateMovie6], sales: [], bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    expect(markers.available.find(m => m.slug === 'china')).toBe(undefined);
    expect(markers.available.find(m => m.slug === 'brazil')).toBe(undefined);
    expect(markers.available.find(m => m.slug === 'angola')).not.toBe(undefined);
  });

  it('Check availability on china with planes media', () => {
    const data = { avails: availsPlanes, mandates: [mandateMovie6], sales: [], bucketContracts: [] };
    const markers = territoryAvailabilities(data);
    expect(markers.available.find(m => m.slug === 'china')).not.toBe(undefined);
    expect(markers.available.find(m => m.slug === 'brazil')).not.toBe(undefined);
  });
});
