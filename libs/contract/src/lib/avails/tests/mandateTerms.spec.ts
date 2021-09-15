import { BucketTerm, Term } from '../../term/+state/term.model';
import { AvailsFilter, getMandateTerms, isInBucket, collidingTerms } from './../avails';
import { mandates } from './../fixtures/mandates';
import { sales } from './../fixtures/sales';
import { mandateTerms as acTerms } from './../fixtures/mandateTerms';
import { saleTerms as acSaleTerms } from './../fixtures/saleTerms';
import {  createBucketTerm } from '@blockframes/contract/bucket/+state/bucket.model';

describe('Test isTermSold pure function', () => {
    const Resurrected = 'Cr3NYe9RXaMwP98LQMyD';
    const GazaMonAmour = 'cXHN9C9GftkMhYmu7CV1';
    const MarinaAbramovic = 'HgU5WygrYoon1QnFqEpe';
    const MotherSchmuckers = 'bR4fTHmDDuOSPrNaz39J';
    const BigFootFamily = '1eJm06mvagJDNJ2yAlDt';

    let bucket: BucketTerm[] = [];

    beforeEach(() => {
        // We are starting with a new bucket for every test
        bucket = [];
    })

    it(`Mandate test (territory)
    Terms: 01/01/2022 - 06/30/2023
    Territory: South Korea
    Rights: Free TV
    Exclusive: No
    Expected result: Not licensed`, () => {
      const acHasRights = getMandateTerms({
        duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, territories: ['south-korea'], medias: ['freeTv'], exclusive: false },
        getTerms(Resurrected, 'mandate')
      );
      expect(!!acHasRights.length).toBe(false);
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected result: Not licensed`, () => {
      const ACRights = getMandateTerms(
        { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['afghanistan','france'], medias: ['freeTv'] },
        getTerms(Resurrected, 'mandate')
      );
      expect(!!ACRights.length).toBe(false)
    });

    it(`Terms: 01/01/2028 - 06/30/2036
    Territory: France
    Rights: Planes
    Exclusive: No
    Expected result: Not licensed`, () => {
      const ACRights = getMandateTerms(
        { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['afghanistan','france'], medias: ['planes'] },
        getTerms(Resurrected, 'mandate')
      );
      expect(!!ACRights.length).toBe(false)
    });

    it(`Terms check (existing ended sale)
    Terms: 01/01/2033 - 06/30/2033
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Available`, () => {
      const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] }
      const ACRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      expect(ACRights.length).toEqual(1);
      const isTermSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      expect(isTermSold).toBe(false);
    });

    it(`Terms check (existing ongoing sale)
    Terms: 01/01/2029 - 06/30/2031
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Not available`, () => {
      const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2031'), from: new Date('01/01/2029') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] }
      const ACRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      expect(ACRights.length).toEqual(1);
      const isTermSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      expect(isTermSold).toBe(true);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: No
        Expected result: Available`, () => {
        const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] }
        const ACRights = getMandateTerms(
          availDetails,
          getTerms(Resurrected, 'mandate')
        );
        expect(ACRights.length).toEqual(1);
        const isTermSold = collidingTerms(
          availDetails,
          getTerms(Resurrected, 'sale')
        );
        expect(isTermSold).toBe(false);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: Yes
        Expected result: Not available`, () => {
        const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] }
        const ACRights = getMandateTerms(
          availDetails,
          getTerms(Resurrected, 'mandate')
        );
        expect(ACRights.length).toEqual(1);
        const isTermSold = collidingTerms(
          availDetails,
          getTerms(Resurrected, 'sale')
        );
        expect(isTermSold).toBe(true);
    });

    it(`Rights check
      Terms: 01/01/2022 - 06/30/2022
      Territory: Argentina
      Rights: S-VOD
      Exclusive: Yes
      Expected result: Available`, () => {
        const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['sVod'] }
        const ACRights = getMandateTerms(
          availDetails,
          getTerms(Resurrected, 'mandate')
        );
        expect(ACRights.length).toEqual(1);
        const isTermSold = collidingTerms(
          availDetails,
          getTerms(Resurrected, 'sale')
        );
        expect(isTermSold).toBe(false);
    });


    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected result: Not available`, () => {
      const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['payTv'] }
      const ACRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      expect(ACRights.length).toEqual(1);
      const isTermSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      expect(isTermSold).toBe(true);
    });

    it(`Exclusivity test (non exclusive)
      Terms: 01/01/2022 - 06/30/2022
      Territory: Germany
      Rights: Free TV
      Exclusive: No
      Expected result: Available`, () => {
        const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany'], medias: ['freeTv'] }
        const ACRights = getMandateTerms(
          availDetails,
          getTerms(Resurrected, 'mandate')
        );
        expect(ACRights.length).toEqual(1);
        const isTermSold = collidingTerms(
          availDetails,
          getTerms(Resurrected, 'sale')
        );
        expect(isTermSold).toBe(false);
    });

    it(`Exclusivity test (exclusive)
      Terms: 01/01/2021 - 06/30/2021
      Territory: Canada
      Rights: Free TV
      Exclusive: Yes
      Expected result: Not available`, () => {
        // need to put in unix timestamp
        const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2021'), from: new Date(1609513293 * 1000) }, exclusive: true, territories: ['canada'], medias: ['freeTv'] };
        const ACRights = getMandateTerms(
          availDetails,
          getTerms(Resurrected, 'mandate')
        );
        expect(ACRights.length).toEqual(1);
        const isTermSold = collidingTerms(
          availDetails,
          getTerms(Resurrected, 'sale')
        );
        expect(isTermSold).toBe(true);
    });

    // MULTI AVAILS TEST

    it(`Mandate test (territory)
    Terms: 01/01/2022 - 06/30/2023
    Territory: South Korea
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not licensed: Resurrected, 512 Hours With Marina Abramovic (mandate without territory)
    Not available: Gaza mon amour (sale)
    Available: Mother Schmuckers, Bigfoot Family`, () => {
      const availDetails: AvailsFilter = { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] };
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(false);
      expect(!!hoursRights.length).toBe(false);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      expect(isGazaSold).toBe(true);
      expect(isMotherSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Mandate test (terms)
    Terms: 01/01/2022 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not licensed: Resurrected, Gaza mon amour (mandate ended)
    Not available: Mother Schmuckers, 512 Hours With Marina Abramovic (sale)
    Available: Bigfoot Family`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2036'), from: new Date('01/01/2022') }, exclusive: false,
        territories: ['afghanistan'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(false);
      expect(!!resurrectedRights.length).toBe(false);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      expect(isMotherSold).toBe(true);
      expect(isHoursSold).toBe(true);
      expect(isBigfootSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Mandate test (rights)
    Terms: 01/01/2028 - 06/30/2030
    Territory: France
    Rights: Planes
    Exclusive: No
    Expected results:
    Not licensed: Resurrected (right not licensed)
    Not available: Mother Schmuckers (sale)
    Available: Bigfoot Family, 512 Hours With Marina Abramovic, Gaza mon amour`, () => {
      const availDetails: AvailsFilter = {
          duration: { to: new Date('06/30/2030'), from: new Date('01/01/2028') }, exclusive: false,
          territories: ['france'], medias: ['planes']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(false);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(true);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      expect(isGazaSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Terms check (existing ended sale)
    Terms: 01/01/2033 - 06/30/2033
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Mother Schmuckers (non exclusive German sale), Gaza mon amour (non exclusive Russian sale)
    Available: Resurrected, Bigfoot Family, 512 Hours With Marina Abramovic`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true,
        territories: ['germany', 'czech', 'russia'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(true);
      expect(isGazaSold).toBe(true);
      expect(isResurrectedSold).toBe(false);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Terms check (existing ongoing sale)
    Terms: 01/01/2029 - 06/30/2031
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (existing ongoing sale)
    Available: Bigfoot Family, 512 Hours With Marina Abramovic, Gaza mon amour, Mother Schmuckers`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2031'), from: new Date('01/01/2029') }, exclusive: true,
        territories: ['germany', 'czech', 'russia'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isResurrectedSold).toBe(true);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Cross territory check + exclusivity
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not available: Bigfoot Family (exclu sale), 512 Hours With Marina Abramovic (exclu sale)
    Available: Gaza mon amour (non exclusive sale), Mother Schmuckers, Resurrected`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false,
        territories: ['germany', 'czech', 'russia'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(true);
      expect(isBigfootSold).toBe(true);
      expect(isResurrectedSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })


    it(`Cross territory check + exclusivity
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (non exclu sale), Bigfoot Family (exclu sale), 512 Hours With Marina Abramovic (exclu sale), Gaza mon amour (non exclusive sale)
    Available: Mother Schmuckers`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true,
        territories: ['germany', 'czech', 'russia'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(true);
      expect(isHoursSold).toBe(true);
      expect(isBigfootSold).toBe(true);
      expect(isResurrectedSold).toBe(true);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: S-VOD
    Exclusive: Yes
    Expected results:
    Not available: Bigfoot Family (svod sale),
    Available: Mother Schmuckers, Resurrected, 512 Hours With Marina Abramovic, Gaza mon amour`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('01/01/2022'), from: new Date('06/30/2022') }, exclusive: true,
        territories: ['argentina'], medias: ['sVod']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(true);
      expect(isResurrectedSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (sale),
    Available: Mother Schmuckers, 512 Hours With Marina Abramovic, Gaza mon amour, Bigfoot Family`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive:true,
        territories: ['argentina'], medias: ['payTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      expect(isResurrectedSold).toBe(true);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (sale),
    Available: Mother Schmuckers, 512 Hours With Marina Abramovic, Gaza mon amour, Bigfoot Family`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true,
        territories: ['argentina'], medias: ['payTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      expect(isResurrectedSold).toBe(true);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })

    it(`Exclusivity test (non exclusive)
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not available: 512 Hours With Marina Abramovic, Bigfoot Family (exclusive sales)
    Available: Mother Schmuckers, Gaza mon amour, Resurrected`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false,
        territories: ['germany'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(true);
      expect(isBigfootSold).toBe(true);
      expect(isResurrectedSold).toBe(false);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })


    it(`Exclusivity test (exclusive)
    Terms: 01/01/2021 - 06/30/2021
    Territory: Canada
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected
    Available: Mother Schmuckers, Gaza mon amour, 512 Hours With Marina Abramovic, Bigfoot Family`, () => {
      const availDetails: AvailsFilter = {
        duration: { to: new Date('01/01/2021'), from: new Date('06/30/2021') }, exclusive: true,
        territories: ['canada'], medias: ['freeTv']
      }
      const gazaRights = getMandateTerms(
        availDetails,
        getTerms(GazaMonAmour, 'mandate')
      );
      const resurrectedRights = getMandateTerms(
        availDetails,
        getTerms(Resurrected, 'mandate')
      );
      const hoursRights = getMandateTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'mandate')
      );
      const motherSchmuckersRights = getMandateTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'mandate')
      );
      const bigFootFamilyRights = getMandateTerms(
        availDetails,
        getTerms(BigFootFamily, 'mandate')
      );
      expect(!!gazaRights.length).toBe(true);
      expect(!!resurrectedRights.length).toBe(true);
      expect(!!hoursRights.length).toBe(true);
      expect(!!motherSchmuckersRights.length).toBe(true);
      expect(!!bigFootFamilyRights.length).toBe(true);
      const isMotherSold = collidingTerms(
        availDetails,
        getTerms(MotherSchmuckers, 'sale')
      );
      const isHoursSold = collidingTerms(
        availDetails,
        getTerms(MarinaAbramovic, 'sale')
      );
      const isBigfootSold = collidingTerms(
        availDetails,
        getTerms(BigFootFamily, 'sale')
      );
      const isResurrectedSold = collidingTerms(
        availDetails,
        getTerms(Resurrected, 'sale')
      );
      const isGazaSold = collidingTerms(
        availDetails,
        getTerms(GazaMonAmour, 'sale')
      );
      expect(isMotherSold).toBe(false);
      expect(isGazaSold).toBe(false);
      expect(isHoursSold).toBe(false);
      expect(isBigfootSold).toBe(false);
      expect(isResurrectedSold).toBe(true);
      bucket.push(createBucketTerm(availDetails));
      expect(isInBucket(availDetails, bucket)).toBe(true)
    })
})

function toDate(term: Term<Date>): Term<Date> {
    term.duration.from = new Date(term.duration.from)
    term.duration.to = new Date(term.duration.to)
    return term
}

function getTerms(titleId: string, type: 'mandate' | 'sale'): Term<Date>[] {
  const contracts = type === 'mandate' ? mandates : sales;
  const termIds = contracts.filter(contract => contract.titleId === titleId).map(sale => sale.termIds).flat();
  const terms = type === 'mandate'
    ? (acTerms as unknown[]).map(toDate)
    : (acSaleTerms as unknown[]).map(toDate)
  return terms.filter(term => termIds.includes(term.id));
}
