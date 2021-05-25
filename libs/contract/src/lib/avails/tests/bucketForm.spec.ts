import { createMandate } from "../../contract/+state/contract.model";
import { AvailsFilter, findSameMapTermIndex, getTerritories, toTerritoryMarker } from "./../avails";
import { BucketForm } from '@blockframes/contract/bucket/form'
import { createTerm } from "../../term/+state/term.model";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";
import { availDetailsExclusive } from './../fixtures/availsFilters';

describe('Test BucketForm behaviors', () => {

  it('Add 2 territories to same contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany'],
      exclusive: true
    });

    const selected1 = toTerritoryMarker('germany', [mandate], term);
    bucketForm.addTerritory(availDetailsExclusive, selected1);

    const selected2 = toTerritoryMarker('france', [mandate], term);
    bucketForm.addTerritory(availDetailsExclusive, selected2);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
  });

  it('Add 2 territories from various mandates resulting in 2 disctinct contracts in bucket', () => {
    const bucketForm = new BucketForm();

    const mandateA = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const termA = createTerm({
      id: 'termA',
      contractId: mandateA.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'australia'],
      exclusive: true
    });

    const mandateB = createMandate({
      id: 'MandateB',
      termIds: ['termB'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const termB = createTerm({
      id: 'termB',
      contractId: mandateB.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['germany', 'india'],
      exclusive: true
    });

    const selected1 = toTerritoryMarker('france', [mandateA], termA);
    bucketForm.addTerritory(availDetailsExclusive, selected1);

    const selected2 = toTerritoryMarker('germany', [mandateB], termB);
    bucketForm.addTerritory(availDetailsExclusive, selected2);

    expect(bucketForm.value.contracts.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories[0]).toBe('france');

    expect(bucketForm.value.contracts[1].terms.length).toBe(1);
    expect(bucketForm.value.contracts[1].terms[0].territories.length).toBe(1);
    expect(bucketForm.value.contracts[1].terms[0].territories[0]).toBe('germany');
  });

  it('Removes territories from selection', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany'],
      exclusive: true
    });

    const selected1 = toTerritoryMarker('germany', [mandate], term);
    bucketForm.addTerritory(availDetailsExclusive, selected1);

    const selected2 = toTerritoryMarker('france', [mandate], term);
    bucketForm.addTerritory(availDetailsExclusive, selected2);

    expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected1)).toBe(true);
    expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected2)).toBe(true);

    bucketForm.removeTerritory(availDetailsExclusive, selected2);
    expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected2)).toBe(false);

    bucketForm.removeTerritory(availDetailsExclusive, selected1);
    expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected1)).toBe(false);

    expect(bucketForm.value.contracts[0].terms.length).toBe(0);
  });

  it('Should find and return termIndex', () => {

    const bucketTermA = createBucketTerm({ // Not same medias
      duration: {
        from: new Date('06/01/2021'),
        to: new Date('12/01/2021')
      },
      medias: ['theatrical', 'hotels'],
      exclusive: true,
      territories: ['france', 'spain', 'united-states-of-america']
    });

    const bucketTermB = createBucketTerm({// Not same dates
      duration: {
        from: new Date('06/01/2022'),
        to: new Date('12/01/2022')
      },
      medias: ['theatrical', 'hotels'],
      exclusive: true,
      territories: ['france', 'spain', 'united-states-of-america']
    });

    const bucketTermC = createBucketTerm({ // Matching
      duration: {
        from: new Date('06/01/2021'),
        to: new Date('12/01/2021')
      },
      medias: ['theatrical'],
      exclusive: true,
      territories: ['france', 'spain', 'united-states-of-america']
    });

    const terms = [bucketTermA, bucketTermB, bucketTermC];
    const termIndex = findSameMapTermIndex(terms, availDetailsExclusive);
    expect(termIndex).toBe(2);
  });

  it('Should return -1 if index is not found', () => {

    const bucketTermA = createBucketTerm({ // Not same medias
      duration: {
        from: new Date('06/01/2021'),
        to: new Date('12/01/2021')
      },
      medias: ['theatrical', 'hotels'],
      exclusive: true,
      territories: ['france', 'spain', 'united-states-of-america']
    });

    const bucketTermB = createBucketTerm({// Not same dates
      duration: {
        from: new Date('06/01/2022'),
        to: new Date('12/01/2022')
      },
      medias: ['theatrical', 'hotels'],
      exclusive: true,
      territories: ['france', 'spain', 'united-states-of-america']
    });

    const terms = [bucketTermA, bucketTermB];
    const termIndex = findSameMapTermIndex(terms, availDetailsExclusive);
    expect(termIndex).toBe(-1);
  });

  it('Should return territories selected', () => {
    const bucketForm = new BucketForm();
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
      exclusive: true,
      medias: ['theatrical']
    };

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany', 'spain'],
      exclusive: true
    });

    const selected1 = toTerritoryMarker('germany', [mandate], term);
    bucketForm.addTerritory(availDetails, selected1);

    const selected2 = toTerritoryMarker('france', [mandate], term);
    bucketForm.addTerritory(availDetails, selected2);

    const availFilter: AvailsFilter = {
      duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
      exclusive: true,
      medias: ['theatrical']
    };
    const territories = getTerritories(availFilter, bucketForm.value, 'exact');

    expect(territories.length).toBe(2);
    expect(territories.some(t => t === 'france')).toBe(true);
    expect(territories.some(t => t === 'germany')).toBe(true);
  });

  it('Should return territories in selection', () => {
    const bucketForm = new BucketForm();
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2019'), to: new Date('01/01/2031') },
      exclusive: true,
      medias: ['theatrical']
    };

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany', 'spain'],
      exclusive: true
    });

    const selected1 = toTerritoryMarker('germany', [mandate], term);
    bucketForm.addTerritory(availDetails, selected1);

    const availFilter: AvailsFilter = {
      duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
      exclusive: true,
      medias: ['theatrical']
    };
    const territories = getTerritories(availFilter, bucketForm.value, 'in');

    expect(territories.length).toBe(1);
    expect(territories.some(t => t === 'germany')).toBe(true);
  });
})

