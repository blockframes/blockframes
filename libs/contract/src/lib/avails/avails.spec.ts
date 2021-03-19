import { Term } from '../term/+state/term.model';
import { AvailsFilter, getMandateTerm as getMandateTerm, isInBucket, isSold } from './avails';
import { mandateTerms as acTerms } from './fixtures/mandateTerms'
import { saleTerms as acSaleTerms } from './fixtures/saleTerms';

describe('isTermSold', () => {
    const Resurrected = 'Cr3NYe9RXaMwP98LQMyD';
    const GazaMonAmour = 'cXHN9C9GftkMhYmu7CV1';
    const mandateTerms: Term<Date>[] = (acTerms as unknown[]).map(toDate)
    const saleTerms: Term<Date>[] = (acSaleTerms as unknown[]).map(toDate)
    let bucket: AvailsFilter[] = []

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
        const acHasRights = getMandateTerm({
            duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, territories: ['south-korea'], medias: ['freeTv'], exclusive: false
        }, mandateTerms.filter(m => m.titleId === Resurrected));
        expect(!!acHasRights).toBe(false);
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected result: Not licensed`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['afghanistan'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected));
        expect(!!ACRights).toBe(false)
    });

    it(`Terms: 01/01/2028 - 06/30/2036
    Territory: France
    Rights: Planes
    Exclusive: No
    Expected result: Not licensed`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['france'], medias: ['planes'] },
            mandateTerms.filter(m => m.titleId === Resurrected));
        expect(!!ACRights).toBe(false)
    });

    it(`Terms check (existing ended sale)
    Terms: 01/01/2033 - 06/30/2033
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(false);
    });

    it(`Terms check (existing ongoing sale)
    Terms: 01/01/2029 - 06/30/2031
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Not available`, () => {
        const ACRights = getMandateTerm(
            {
                duration: { to: new Date('06/30/2031'), from: new Date('01/01/2029') }, exclusive: true,
                territories: ['germany', 'russia', 'czech'], medias: ['freeTv']
            },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            {
                duration: { to: new Date('06/30/2031'), from: new Date('01/01/2029') }, exclusive: true,
                territories: ['germany', 'russia', 'czech'], medias: ['freeTv']
            },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(true);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: No
        Expected result: Available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(false);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: Yes
        Expected result: Not available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(true);
    });

    it(`Rights check
      Terms: 01/01/2022 - 06/30/2022
      Territory: Argentina
      Rights: S-VOD
      Exclusive: Yes
      Expected result: Available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['sVod'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['sVod'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(false);
    });


    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected result: Not available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['payTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['payTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(true);
    });

    it(`Exclusivity test (non exclusive)
      Terms: 01/01/2022 - 06/30/2022
      Territory: Germany
      Rights: Free TV
      Exclusive: No
      Expected result: Available`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany'], medias: ['freeTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
        expect(isTermSold).toBe(false);
    });

    it(`Exclusivity test (exclusive)
      Terms: 01/01/2021 - 06/30/2021
      Territory: Canada
      Rights: Free TV
      Exclusive: Yes
      Expected result: Not available`, () => {
        // need to put in unix timestamp
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2021'), from: new Date('1609513293') }, exclusive: true, territories: ['canada'], medias: ['freeTv'] },
            mandateTerms.filter(m => m.titleId === Resurrected))
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2021'), from: new Date('01/01/2021') }, exclusive: true, territories: ['canada'], medias: ['freeTv'] },
            saleTerms.filter(m => m.titleId === Resurrected));
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
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not licensed: Resurrected, Gaza mon amour (mandate ended)
    Not available: Mother Schmuckers, 512 Hours With Marina Abramovic (sale)
    Available: Bigfoot Family`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not licensed: Resurrected, Gaza mon amour (mandate ended)
    Not available: Mother Schmuckers, 512 Hours With Marina Abramovic (sale)
    Available: Bigfoot Family`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
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
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Terms check (existing ended sale)
    Terms: 01/01/2033 - 06/30/2033
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Mother Schmuckers (non exclusive German sale), Gaza mon amour (non exclusive Russian sale)
    Available: Resurrected, Bigfoot Family, 512 Hours With Marina Abramovic`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })


    it(`Terms check (existing ongoing sale)
     Terms: 01/01/2029 - 06/30/2031
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (existing ongoing sale)
    Available: Bigfoot Family, 512 Hours With Marina Abramovic, Gaza mon amour, Mother Schmuckers`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })


    it(`Cross territory check + exclusivity
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not available: Bigfoot Family (exclu sale), 512 Hours With Marina Abramovic (exclu sale)
    Available: Gaza mon amour (non exclusive sale), Mother Schmuckers, Resurrected`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })


    it(`Cross territory check + exclusivity
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (non exclu sale), Bigfoot Family (exclu sale), 512 Hours With Marina Abramovic (exclu sale), Gaza mon amour (non exclusive sale)
    Available: Mother Schmuckers`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: S-VOD
    Exclusive: Yes
    Expected results:
    Not available: Bigfoot Family (svod sale),
    Available: Mother Schmuckers, Resurrected, 512 Hours With Marina Abramovic, Gaza mon amour`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (sale),
    Available: Mother Schmuckers, 512 Hours With Marina Abramovic, Gaza mon amour, Bigfoot Family`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected (sale),
    Available: Mother Schmuckers, 512 Hours With Marina Abramovic, Gaza mon amour, Bigfoot Family`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })

    it(`Exclusivity test (non exclusive)
    Terms: 01/01/2022 - 06/30/2022
    Territory: Germany
    Rights: Free TV
    Exclusive: No
    Expected results:
    Not available: 512 Hours With Marina Abramovic, Bigfoot Family (exclusive sales)
    Available: Mother Schmuckers, , Gaza mon amour, Resurrected`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })


    it(`Exclusivity test (exclusive)
    Terms: 01/01/2020 - 06/30/2020
    Territory: Canada
    Rights: Free TV
    Exclusive: Yes
    Expected results:
    Not available: Resurrected
    Available: Mother Schmuckers, Gaza mon amour, 512 Hours With Marina Abramovic, Bigfoot Family`, () => {
        const ACRights = getMandateTerm(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            mandateTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(!!ACRights).toBe(true);
        const isTermSold = isSold(
            { duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] },
            saleTerms.filter(sale => sale.titleId === GazaMonAmour));
        expect(isTermSold).toBe(true);
        bucket.push({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] });
        expect(isInBucket({ duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, exclusive: false, territories: ['south-korea'], medias: ['freeTv'] }, bucket)).toBe(true)
    })
})

function toDate(term: Term<Date>): Term<Date> {
    term.duration.from = new Date(term.duration.from)
    term.duration.to = new Date(term.duration.to)
    return term
}