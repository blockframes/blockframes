import { AvailsFilter, isInCalendarTerm, isInMapTerm, isSameCalendarTerm, isSameMapTerm } from "./../avails";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";
import { Media, Territory } from "@blockframes/utils/static-model";

describe.skip('BucketTerm', () => {
  describe('Test isSameMapTerm pure function', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    it('Checks if two terms are the same', () => {

      const bucketTerm = createBucketTerm(availDetails);
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
    });

    it('Checks if two terms are not the same', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/29/2030') } });
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('if is SameMapTerm then is not InMapTerm', () => {
      const bucketTerm = createBucketTerm(availDetails);
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(false);
    });

  })

  describe('Test isInMapTerm pure function', () => {
    const territories: Territory[] = ['france'];
    const medias: Media[] = ['planes'];

    it('Checks if one term is included in the other', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
        territories, medias,
      };

      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') } });
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(true);
      // Should also not be sameMapTerm
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Checks if one term is outside the other', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/04/2028'), to: new Date('06/30/2031') }, exclusive: false,
        territories, medias,
      };

      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') } });
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(false);
      // Should also not be sameMapTerm
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('If is SameMapTerm then is not InMapTerm', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
        territories, medias,
      };

      const bucketTerm = createBucketTerm(availDetails);
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('If avail "from" is after bucket "from" but with same "to" : isInMapTerm is true', () => {
      const to = new Date('06/30/2030');
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/02/2028'), to }, exclusive: false,
        territories, medias,
      };

      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to } });
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(true);
    });

    it('If avail "to" is before bucket "to" but with same "from" : isInMapTerm is true', () => {
      const from = new Date('01/01/2028')
      const availDetails: AvailsFilter = {
        duration: { from, to: new Date('06/29/2030') }, exclusive: false,
        territories, medias,
      };

      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from, to: new Date('06/30/2030') } });
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
      expect(isInMapTerm(bucketTerm, availDetails)).toBe(true);
    });
  })

  describe('Test isSameCalendarTerm pure function', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    it('Checks if two terms are the same', () => {
      const bucketTerm = createBucketTerm(availDetails);
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(true);
    });

    it('Even with different durations, terms are the same', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2029'), to: new Date('06/30/2035') } });
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(true);
    });

    it('Not same territories, the two terms are not the same', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, territories: ['germany'] });
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Not same medias, the two terms are not the same', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, medias: ['educational'] });
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Not same exclusivity, the two terms are not the same', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, exclusive: true });
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

  })

  describe('Test isInCalendarTerm pure function', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
      territories: ['france', 'italy'], medias: ['planes', 'educational']
    };

    it('Checks if one term is included in the other: territories and medias', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, territories: ['france', 'italy', 'spain'], medias: ['planes', 'educational', 'est'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(true);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Checks if one term is included in the other: territories only', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, territories: ['france', 'italy', 'spain'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(true);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Checks if one term is included in the other: medias only', () => {
      const bucketTerm = createBucketTerm({ ...availDetails, medias: ['planes', 'educational', 'est'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(true);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('Neither all territories nor all medias are in term', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
        territories: ['france', 'italy', 'spain'], medias: ['planes', 'educational', 'est']
      };

      const bucketTerm = createBucketTerm({ ...availDetails, medias: ['planes', 'educational'], territories: ['france', 'italy'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(false);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('All medias are in term, but not territories', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
        territories: ['france', 'italy', 'spain'], medias: ['planes', 'educational']
      };

      const bucketTerm = createBucketTerm({ ...availDetails, medias: ['planes', 'educational'], territories: ['france', 'italy'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(false);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('All territories are in term, but not medias', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
        territories: ['france', 'italy'], medias: ['planes', 'educational', 'est']
      };

      const bucketTerm = createBucketTerm({ ...availDetails, medias: ['planes', 'educational'], territories: ['france', 'italy', 'spain'] });
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(false);
      // Should also not be sameCalendarTerm
      expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

    it('If is sameMapTerm then is not isInCalendarTerm', () => {
      const availDetails: AvailsFilter = {
        duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
        territories: ['france'], medias: ['planes']
      };

      const bucketTerm = createBucketTerm(availDetails);
      expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
      expect(isInCalendarTerm(bucketTerm, availDetails)).toBe(false);
    });

  })
});
