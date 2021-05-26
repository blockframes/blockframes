import { AvailsFilter, isInTerm, isSameCalendarTerm, isSameMapTerm } from "./../avails";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";

describe('Test isSameMapTerm pure function', () => {

  it('Checks if two terms are the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
  });

  it('Checks if two terms are not the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/29/2030') } });
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
  });

  it('if is SameMapTerm then is not InTerm', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
    expect(isInTerm(bucketTerm, availDetails)).toBe(false);
  });

})

describe('Test isInTerm pure function', () => {

  it('Checks if one term is included in the other', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/04/2028'), to: new Date('06/29/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') } });
    expect(isInTerm(bucketTerm, availDetails)).toBe(true);
  });

  it('Checks if one term is outside the other', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/04/2028'), to: new Date('06/30/2031') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') } });
    expect(isInTerm(bucketTerm, availDetails)).toBe(false);
  });

  it('If is SameMapTerm then is not InTerm', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(true);
    expect(isInTerm(bucketTerm, availDetails)).toBe(false);
  });

  it('If avail "from" is after bucket "from" but with same "to" : isInTerm is true', () => {
    const to = new Date('06/30/2030');
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/02/2028'), to }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to } });
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
    expect(isInTerm(bucketTerm, availDetails)).toBe(true);
  });

  it('If avail "to" is before bucket "to" but with same "from" : isInTerm is true', () => {
    const from = new Date('01/01/2028')
    const availDetails: AvailsFilter = {
      duration: { from, to: new Date('06/29/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from, to: new Date('06/30/2030') } });
    expect(isSameMapTerm(bucketTerm, availDetails)).toBe(false);
    expect(isInTerm(bucketTerm, availDetails)).toBe(true);
  });
})

describe('Test isSameCalendarTerm pure function', () => {

  it('Checks if two terms are the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(true);
  });

  it('Checks if two terms are not the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, territories: ['germany'] });
    expect(isSameCalendarTerm(bucketTerm, availDetails)).toBe(false);
  });

})
