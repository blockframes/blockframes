
import { Term } from '@blockframes/contract/term/+state';
import { Mandate } from '@blockframes/contract/contract/+state';
import { AvailableTerritoryMarker, BucketTerritoryMarker, CalendarAvailsFilter, DurationMarker, MapAvailsFilter } from '@blockframes/contract/avails/new-avails';

import { BucketForm } from '../form';


function fakeMandate(mandate?: Partial<Mandate>): Mandate {
  return {
    type: 'mandate',
    _meta: { createdBy: '', createdAt: new Date() },
    id: '',
    parentTermId: '',
    sellerId: '',
    stakeholders: [],
    status: 'accepted',
    termIds: [],
    titleId: '',
    ...mandate,
  }
}

function fakeTerm(term?: Partial<Term>): Term {
  return {
    contractId: '',
    criteria: [],
    duration: { from: new Date(), to: new Date() },
    exclusive: true,
    id: '',
    languages: {},
    licensedOriginal: true,
    medias: [],
    territories: [],
    ...term,
  }
}

const mapFilterA: MapAvailsFilter = {
  exclusive: true,
  medias: [ 'payTv' ],
  duration: { from: new Date(2), to: new Date(8) },
};

const mapFilterB: MapAvailsFilter = {
  exclusive: true,
  medias: [ 'payTv' ],
  duration: { from: new Date(9), to: new Date(24) },
};

const calendarFilterA: CalendarAvailsFilter = {
  exclusive: true,
  medias: ['payTv'],
  territories: ['france', 'germany'],
};



describe('BucketForm', () => {
  describe('addTerritory', () => {
    it('Add one territory', () => {
      const bucket = new BucketForm();

      const marker: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: fakeMandate({ id: 'A' }),
        term: fakeTerm({
          id: 'termA',
          contractId: 'A',
          exclusive: true,
          medias: ['payTv'],
          territories: ['france', 'germany'],
          duration: { from: new Date(1), to: new Date(24) },
        }),
      };

      bucket.addTerritory(mapFilterA, marker);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].parentTermId).toBe('termA');
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].exclusive).toBe(true);
      expect(bucket.value.contracts[0].terms[0].medias.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].medias[0]).toBe('payTv');
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');
      expect(bucket.value.contracts[0].terms[0].duration.from).toEqual(new Date(2));
      expect(bucket.value.contracts[0].terms[0].duration.to).toEqual(new Date(8));
    });
    it('Add two territories to the same term', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: mandate,
        term,
      };

      const markerB: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'germany',
        label: 'Germany',
        isoA3: 'DEU',
        contract: mandate,
        term,
      };

      bucket.addTerritory(mapFilterA, markerA);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');

      bucket.addTerritory(mapFilterA, markerB);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(2);
      expect(bucket.value.contracts[0].terms[0].territories[1]).toBe('germany');
    });
    it('Add two territories to different terms', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: mandate,
        term,
      };

      const markerB: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'germany',
        label: 'Germany',
        isoA3: 'DEU',
        contract: mandate,
        term,
      };

      bucket.addTerritory(mapFilterA, markerA);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');

      bucket.addTerritory(mapFilterB, markerB);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(2);
      expect(bucket.value.contracts[0].terms[1].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[1].territories[0]).toBe('germany');
    });
  });

  describe('removeTerritory', () => {
    it('Remove only the territory', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: mandate,
        term,
      };

      const markerB: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'germany',
        label: 'Germany',
        isoA3: 'DEU',
        contract: mandate,
        term,
      };

      bucket.addTerritory(mapFilterA, markerA);
      bucket.addTerritory(mapFilterA, markerB);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(2);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');
      expect(bucket.value.contracts[0].terms[0].territories[1]).toBe('germany');


      const bucketMarker: BucketTerritoryMarker = {
        type: 'in-bucket',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: bucket.value.contracts[0],
        term: bucket.value.contracts[0].terms[0],
      };

      bucket.removeTerritory(mapFilterA, bucketMarker);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('germany');
    });
    it('Remove the term if it was the last territory', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: mandate,
        term,
      };

      bucket.addTerritory(mapFilterA, markerA);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');

      const bucketMarker: BucketTerritoryMarker = {
        type: 'in-bucket',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: bucket.value.contracts[0],
        term: bucket.value.contracts[0].terms[0],
      };

      bucket.removeTerritory(mapFilterA, bucketMarker);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(0);
    });
  });
  describe('isAlreadyInBucket', () => {
    it('Should return true with existing and false otherwise', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: AvailableTerritoryMarker = {
        type: 'available',
        slug: 'france',
        label: 'France',
        isoA3: 'FRA',
        contract: mandate,
        term,
      };

      const before = bucket.isAlreadyInBucket(mapFilterA, markerA);

      bucket.addTerritory(mapFilterA, markerA);

      const after = bucket.isAlreadyInBucket(mapFilterA, markerA);

      expect(before).toBeFalsy();
      expect(after).toBeTruthy();
    });
  });
  describe('addDuration', () => {
    it('Add one duration', () => {

      const bucket = new BucketForm();

      const marker: DurationMarker = {
        contract: fakeMandate({ id: 'A' }),
        term: fakeTerm({
          id: 'termA',
          contractId: 'A',
          exclusive: true,
          medias: ['payTv'],
          territories: ['france', 'germany'],
          duration: { from: new Date(1), to: new Date(24) },
        }),
        from: new Date(4),
        to: new Date(12),
      };

      bucket.addDuration(calendarFilterA, marker);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].parentTermId).toBe('termA');
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].exclusive).toBe(true);
      expect(bucket.value.contracts[0].terms[0].medias.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].medias[0]).toBe('payTv');
      expect(bucket.value.contracts[0].terms[0].territories.length).toBe(2);
      expect(bucket.value.contracts[0].terms[0].territories[0]).toBe('france');
      expect(bucket.value.contracts[0].terms[0].territories[1]).toBe('germany');
      expect(bucket.value.contracts[0].terms[0].duration.from).toEqual(new Date(4));
      expect(bucket.value.contracts[0].terms[0].duration.to).toEqual(new Date(12));
    });
    it('Add two duration to the different term', () => {
      const bucket = new BucketForm();

      const mandate = fakeMandate({ id: 'A' });

      const term = fakeTerm({
        id: 'termA',
        contractId: 'A',
        exclusive: true,
        medias: ['payTv'],
        territories: ['france', 'germany'],
        duration: { from: new Date(1), to: new Date(24) },
      });

      const markerA: DurationMarker = {
        from: new Date(4),
        to: new Date(12),
        contract: mandate,
        term,
      };

      const markerB: DurationMarker = {
        from: new Date(13),
        to: new Date(23),
        contract: mandate,
        term,
      };

      bucket.addDuration(calendarFilterA, markerA);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[0].terms[0].duration.from).toEqual(new Date(4));
      expect(bucket.value.contracts[0].terms[0].duration.to).toEqual(new Date(12));

      bucket.addDuration(calendarFilterA, markerB);

      expect(bucket.value.contracts.length).toBe(1);
      expect(bucket.value.contracts[0].terms.length).toBe(2);
      expect(bucket.value.contracts[0].terms[1].duration.from).toEqual(new Date(13));
      expect(bucket.value.contracts[0].terms[1].duration.to).toEqual(new Date(23));
    });
  });
  describe('getTermIndexForCalendar', () => {

    const bucket = new BucketForm();

    const mandateA = fakeMandate({ id: 'A' });

    const mandateB = fakeMandate({ id: 'B' });

    const termA = fakeTerm({
      id: 'termA',
      contractId: 'A',
      exclusive: true,
      medias: ['payTv'],
      territories: ['france', 'germany'],
      duration: { from: new Date(1), to: new Date(24) },
    });

    const termB = fakeTerm({
      id: 'termB',
      contractId: 'B',
      exclusive: true,
      medias: ['payTv'],
      territories: ['france', 'germany'],
      duration: { from: new Date(42), to: new Date(69) },
    });

    const termC = fakeTerm({
      id: 'termC',
      contractId: 'A',
      exclusive: true,
      medias: ['payTv'],
      territories: ['germany'],
      duration: { from: new Date(26), to: new Date(40) },
    });

    const markerA: DurationMarker = {
      from: new Date(4),
      to: new Date(12),
      contract: mandateA,
      term: termA,
    };

    const markerB: DurationMarker = {
      from: new Date(42),
      to: new Date(51),
      contract: mandateB,
      term: termB,
    };

    const markerC: DurationMarker = {
      from: new Date(27),
      to: new Date(32),
      contract: mandateA,
      term: termC,
    };

    bucket.addDuration(calendarFilterA, markerA);
    bucket.addDuration(calendarFilterA, markerB);
    bucket.addDuration(calendarFilterA, markerC);

    it('Check index', () => {

      expect(bucket.value.contracts.length).toBe(3);
      expect(bucket.value.contracts[0].terms.length).toBe(1);
      expect(bucket.value.contracts[1].terms.length).toBe(1);
      expect(bucket.value.contracts[2].terms.length).toBe(1);

      const a = bucket.getTermIndexForCalendar(calendarFilterA, markerA);
      const b = bucket.getTermIndexForCalendar(calendarFilterA, markerB);
      const c = bucket.getTermIndexForCalendar(calendarFilterA, markerC);

      expect(a.termIndex).toBe(0);
      expect(a.contractIndex).toBe(0);

      expect(b.termIndex).toBe(0);
      expect(b.contractIndex).toBe(1);

      expect(c.termIndex).toBe(0);
      expect(c.contractIndex).toBe(2);
    });
  });
});
