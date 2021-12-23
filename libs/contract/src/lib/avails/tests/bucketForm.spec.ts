import { createMandate } from "../../contract/+state/contract.model";
import { isSameMapTerm, getSelectedTerritories, toTerritoryMarker, toDurationMarker } from "./../avails";
import { BucketForm } from '@blockframes/contract/bucket/form'
import { createTerm, Duration, BucketTerm } from "../../term/+state/term.model";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";
import { availDetailsExclusive } from './../fixtures/availsFilters';
import { Territory } from "@blockframes/utils/static-model";
import { AvailsFilter, AvailableTerritoryMarker, MapAvailsFilter } from "../new-avails";


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

describe('BucketForm', () => {
  describe('Test BucketForm behaviors for territories', () => {



    it.skip('Add 2 territories to same contract bucket', () => {
      const bucketForm = new BucketForm();

      const selected1 = toTerritoryMarker('australia', [mandateA], termA) as AvailableTerritoryMarker;
      const selected2 = toTerritoryMarker('france', [mandateA], termA) as AvailableTerritoryMarker;

      bucketForm.addTerritory(availDetailsExclusive, selected1);
      bucketForm.addTerritory(availDetailsExclusive, selected2);

      expect(bucketForm.value.contracts.length).toBe(1);
      expect(bucketForm.value.contracts[0].terms.length).toBe(1);
      expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
    });

    it.skip('Add 2 territories from various mandates resulting in 2 disctinct contracts in bucket', () => {
      const bucketForm = new BucketForm();

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

      const selected1 = toTerritoryMarker('france', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availDetailsExclusive, selected1);

      const selected2 = toTerritoryMarker('germany', [mandateB], termB) as AvailableTerritoryMarker;
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

      const selected1 = toTerritoryMarker('australia', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availDetailsExclusive, selected1);

      expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected1)).toBe(true);

      const selected2 = toTerritoryMarker('france', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availDetailsExclusive, selected2);

      expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected2)).toBe(true);

      // TODO issue#7356 & issue#7313 : re-write avails tests
      // bucketForm.removeTerritory(availDetailsExclusive, selected2);
      // expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected2)).toBe(false);

      // bucketForm.removeTerritory(availDetailsExclusive, selected1);
      // expect(bucketForm.isAlreadyInBucket(availDetailsExclusive, selected1)).toBe(false);

      // expect(bucketForm.value.contracts[0].terms.length).toBe(0);
    });

    it.skip('Should find and return termIndex', () => {
      const territories: Territory[] = ['france', 'spain', 'united-states-of-america']
      const duration: Duration = {
        from: new Date('06/01/2021'),
        to: new Date('12/01/2021')
      }
      const bucketTermA = createBucketTerm({ // Not same medias
        duration,
        medias: ['theatrical', 'hotels'],
        exclusive: true,
        territories,
      });

      const bucketTermB = createBucketTerm({// Not same dates
        duration: {
          from: new Date('06/01/2022'),
          to: new Date('12/01/2022')
        },
        medias: ['theatrical', 'hotels'],
        exclusive: true,
        territories,
      });

      const bucketTermC = createBucketTerm({ // Matching
        duration,
        medias: ['theatrical'],
        exclusive: true,
        territories,
      });

      const terms = [bucketTermA, bucketTermB, bucketTermC];
      const termIndex = terms.findIndex(t => isSameMapTerm(t, availDetailsExclusive));
      expect(termIndex).toBe(2);
    });

    it.skip('Should return -1 if index is not found', () => {
      const bucketTermPartial: Partial<BucketTerm> = {
        medias: ['theatrical', 'hotels'],
        exclusive: true,
        territories: ['france', 'spain', 'united-states-of-america']
      }
      const bucketTermA = createBucketTerm({ // Not same medias
        duration: {
          from: new Date('06/01/2021'),
          to: new Date('12/01/2021')
        },
        ...bucketTermPartial,
      });

      const bucketTermB = createBucketTerm({// Not same dates
        duration: {
          from: new Date('06/01/2022'),
          to: new Date('12/01/2022')
        },
        ...bucketTermPartial,
      });

      const terms = [bucketTermA, bucketTermB];
      const termIndex = terms.findIndex(t => isSameMapTerm(t, availDetailsExclusive));
      expect(termIndex).toBe(-1);
    });

    it.skip('Should return territories selected', () => {
      const bucketForm = new BucketForm();
      const availFilter: MapAvailsFilter = {
        exclusive: true,
        medias: ['theatrical'],
        duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
      };

      const selected1 = toTerritoryMarker('australia', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availFilter, selected1);

      const selected2 = toTerritoryMarker('france', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availFilter, selected2);

      const territories = getSelectedTerritories('titleA', availFilter, bucketForm.value, 'exact');

      expect(territories.length).toBe(2);
      expect(territories.some(t => t === 'france')).toBe(true);
      expect(territories.some(t => t === 'australia')).toBe(true);
    });

    it.skip('Should return territories in selection', () => {
      const bucketForm = new BucketForm();

      const availDetails: MapAvailsFilter = {
        duration: { from: new Date('01/01/2019'), to: new Date('01/01/2031') },
        exclusive: true,
        medias: ['theatrical']
      };

      const selected1 = toTerritoryMarker('australia', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availDetails, selected1);

      const availFilter: MapAvailsFilter = {
        duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
        exclusive: true,
        medias: ['theatrical']
      };
      const territories = getSelectedTerritories('titleA', availFilter, bucketForm.value, 'in');

      expect(territories.length).toBe(1);
      expect(territories.some(t => t === 'australia')).toBe(true);
    });

    it.skip('Should return empty array if we search for another movie', () => {
      const bucketForm = new BucketForm();

      const availDetails: MapAvailsFilter = {
        duration: { from: new Date('01/01/2019'), to: new Date('01/01/2031') },
        exclusive: true,
        medias: ['theatrical']
      };


      const selected1 = toTerritoryMarker('germany', [mandateA], termA) as AvailableTerritoryMarker;
      bucketForm.addTerritory(availDetails, selected1);

      const availFilter: MapAvailsFilter = {
        duration: { from: new Date('01/01/2020'), to: new Date('01/01/2030') },
        exclusive: true,
        medias: ['theatrical']
      };
      const territories = getSelectedTerritories('titleB', availFilter, bucketForm.value, 'in');

      expect(territories.length).toBe(0);
    });
  })

  describe.skip('Test BucketForm behaviors for durations', () => {

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

    const mandate = createMandate({ id: 'MandateA', termIds: ['termA', 'termB'] });

    it('Adding two duration with same territories and medias goes to two different terms in same contract bucket', () => {
      const bucketForm = new BucketForm();

      const marker = toDurationMarker([mandateA], termA);


      const availDetailsB: AvailsFilter = {
        ...availDetailsA,
        duration: {
          from: new Date('10/10/2020'),
          to: new Date('10/10/2030'),
        },
      };

      bucketForm.addDuration(availDetailsA, marker);
      bucketForm.addDuration(availDetailsB, marker);

      expect(bucketForm.value.contracts.length).toBe(1);
      expect(bucketForm.value.contracts[0].terms.length).toBe(2);
      expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
    });

    it('Add 2 durations with different territories resulting in two terms in same contract bucket', () => {
      const bucketForm = new BucketForm();

      const marker = toDurationMarker([mandateA], termA);

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

    it('Add 2 durations with different medias resulting in two terms in same contract bucket', () => {
      const bucketForm = new BucketForm();

      const marker = toDurationMarker([mandateA], termA);

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

      const marker = toDurationMarker([mandateA], termA);

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

      const termB = createTerm({ id: 'termB', contractId: mandateA.id });

      const markerA = toDurationMarker([mandateA], termA);
      const markerB = toDurationMarker([mandateA], termB);

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

    it('Should return contract & term index in contract bucket', () => {
      const bucketForm = new BucketForm();

      const termA = createTerm({ id: 'termA', contractId: mandate.id });
      const termB = createTerm({ id: 'termB', contractId: mandate.id });

      const markerA = toDurationMarker([mandate], termA);
      const markerB = toDurationMarker([mandate], termB);

      bucketForm.addDuration(availDetailsA, markerA);
      bucketForm.addDuration(availDetailsA, markerB);

      const index = bucketForm.getTermIndexForCalendar(availDetailsA, markerB);

      expect(index.contractIndex).toBe(1);
      expect(index.termIndex).toBe(0);
    });

    it('Should return undefined if index not found in contract bucket', () => {
      const bucketForm = new BucketForm();

      const termA = createTerm({ id: 'termA', contractId: mandate.id });
      const termB = createTerm({ id: 'termB', contractId: mandate.id });

      const markerA = toDurationMarker([mandate], termA);
      const markerB = toDurationMarker([mandate], termB);

      bucketForm.addDuration(availDetailsA, markerA);
      const index = bucketForm.getTermIndexForCalendar(availDetailsA, markerB);
      expect(index).toBeUndefined();
    });
  });
});
