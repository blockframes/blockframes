import { AvailsFilter, isInTerm, isSameTerm } from "./../avails";
import { createBucketTerm } from "@blockframes/contract/bucket/+state";

describe('Test isSameTerm pure function', () => {

  it('Checks if two terms are the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameTerm(bucketTerm, availDetails)).toBe(true);
  });

  it('Checks if two terms are not the same', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm({ ...availDetails, duration: { from: new Date('01/01/2028'), to: new Date('06/29/2030') } });
    expect(isSameTerm(bucketTerm, availDetails)).toBe(false);
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

  it('If is SameTerm then is not InTerm', () => {
    const availDetails: AvailsFilter = {
      duration: { from: new Date('01/01/2028'), to: new Date('06/30/2030') }, exclusive: false,
      territories: ['france'], medias: ['planes']
    };

    const bucketTerm = createBucketTerm(availDetails);
    expect(isSameTerm(bucketTerm, availDetails)).toBe(true);
    expect(isInTerm(bucketTerm, availDetails)).toBe(false);
  });
})

