import { createMandate } from "../../contract/+state/contract.model";
import { AvailsFilter, isSameMapTerm, getTerritories, toTerritoryMarker, toDurationMarker } from "./../avails";
import { BucketForm } from '@blockframes/contract/bucket/form'
import { createTerm } from "../../term/+state/term.model";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";
import { availDetailsExclusive } from './../fixtures/availsFilters';

describe('Test BucketForm behaviors for territories', () => {

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
    const selected2 = toTerritoryMarker('france', [mandate], term);

    bucketForm.addTerritory(availDetailsExclusive, selected1);
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
    const termIndex = terms.findIndex(t => isSameMapTerm(t, availDetailsExclusive));
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
    const termIndex = terms.findIndex(t => isSameMapTerm(t, availDetailsExclusive));
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

describe('Test BucketForm behaviors for durations', () => {

  it('Adding two duration with same territories and medias goes to same term in same contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA'] });

    const term = createTerm({ id: 'termA', contractId: mandate.id });

    const marker = toDurationMarker([mandate], term);

    const availDetailsA: AvailsFilter = {
      // Set from calendar view
      duration: {
        from: new Date('05/05/2020'),
        to: new Date('05/05/2030'),
      },
      // Set from form
      exclusive: true,
      territories: ['france', 'germany'],
      medias: ['theatrical']
    };

    const availDetailsB: AvailsFilter = {
      ...availDetailsA,
      exclusive: true,
      duration: {
        from: new Date('10/10/2020'),
        to: new Date('10/10/2030'),
      },
    };

    bucketForm.addDuration(availDetailsA, marker);
    bucketForm.addDuration(availDetailsB, marker);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
  });

  it('Add 2 durations with differents territories resulting in two terms in same contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA'] });

    const term = createTerm({ id: 'termA', contractId: mandate.id });

    const marker = toDurationMarker([mandate], term);

    const availDetailsA: AvailsFilter = {
      // Set from calendar view
      duration: {
        from: new Date('05/05/2020'),
        to: new Date('05/05/2030'),
      },
      // Set from form
      exclusive: true,
      territories: ['france', 'germany'],
      medias: ['theatrical']
    };

    const availDetailsB: AvailsFilter = {
      ...availDetailsA,
      duration: {
        from: new Date('10/10/2020'),
        to: new Date('10/10/2030'),
      },
      territories: ['france'],
    };

    bucketForm.addDuration(availDetailsA, marker);
    bucketForm.addDuration(availDetailsB, marker);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms[1].territories.length).toBe(1);
  });

  it('Add 2 durations with differents medias resulting in two terms in same contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA'] });

    const term = createTerm({ id: 'termA', contractId: mandate.id });

    const marker = toDurationMarker([mandate], term);

    const availDetailsA: AvailsFilter = {
      // Set from calendar view
      duration: {
        from: new Date('05/05/2020'),
        to: new Date('05/05/2030'),
      },
      // Set from form
      exclusive: true,
      territories: ['france', 'germany'],
      medias: ['theatrical']
    };

    const availDetailsB: AvailsFilter = {
      ...availDetailsA,
      duration: {
        from: new Date('10/10/2020'),
        to: new Date('10/10/2030'),
      },
      territories: ['france', 'germany'],
      medias: ['rental', 'freeTv']
    };

    bucketForm.addDuration(availDetailsA, marker);
    bucketForm.addDuration(availDetailsB, marker);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms[0].medias.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[1].medias.length).toBe(2);
  });

  it('Add 2 same durations but with not same exclusivity resulting in two terms in same contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA'] });

    const term = createTerm({ id: 'termA', contractId: mandate.id });

    const marker = toDurationMarker([mandate], term);

    const availDetailsA: AvailsFilter = {
      // Set from calendar view
      duration: {
        from: new Date('05/05/2020'),
        to: new Date('05/05/2030'),
      },
      // Set from form
      exclusive: true,
      territories: ['france', 'germany'],
      medias: ['theatrical']
    };

    const availDetailsB: AvailsFilter = {
      ...availDetailsA,
      exclusive: false,
    };

    bucketForm.addDuration(availDetailsA, marker);
    bucketForm.addDuration(availDetailsB, marker);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms[0].exclusive).toBeTruthy();
    expect(bucketForm.value.contracts[0].terms[1].exclusive).toBeFalsy();
  });

  it('Add 2 durations but not from the same parent term resulting in two contracts in contract bucket', () => {
    const bucketForm = new BucketForm();

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA', 'termB'] });

    const termA = createTerm({ id: 'termA', contractId: mandate.id });
    const termB = createTerm({ id: 'termB', contractId: mandate.id });

    const markerA = toDurationMarker([mandate], termA);
    const markerB = toDurationMarker([mandate], termB);

    const availDetails: AvailsFilter = {
      // Set from calendar view
      duration: {
        from: new Date('05/05/2020'),
        to: new Date('05/05/2030'),
      },
      // Set from form
      exclusive: true,
      territories: ['france', 'germany'],
      medias: ['theatrical']
    };

    bucketForm.addDuration(availDetails, markerA);
    bucketForm.addDuration(availDetails, markerB);

    expect(bucketForm.value.contracts.length).toBe(2);
  });
});
