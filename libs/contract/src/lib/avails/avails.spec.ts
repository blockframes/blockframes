import { Mandate, Sale } from '../contract/+state/contract.model';
import { Term } from '../term/+state/term.model';
import { isLicensed, filterSales } from './avails';
import firebase from 'firebase';

export type Timestamp = firebase.firestore.Timestamp;

describe('Avails', () => {
    const titleId = 'Cr3NYe9RXaMwP98LQMyD';
    let contracts;
    let mandateTerms: Term<Timestamp>[];
    let saleTerms: Term<Timestamp>[];
    firebase.initializeApp({ projectId: 'test' }).firestore().useEmulator('localhost', 8080);
    const db = firebase.firestore()

    beforeEach(async () => {
        const contractsRef = await db.collection('contracts').where('titleId', '==', titleId).get()
        contracts = contractsRef.docs.map(ref => ref.data());

        const mandates = contracts.filter((contract: Mandate) => contract.type === 'mandate') as Mandate[]
        const sales = contracts.filter((contract: Sale) => contract.type === 'sale') as Sale[]

        const mandateTermsIds = mandates.map(mandate => mandate.termsIds).flat();
        const saleTermsIds = sales.map(sale => sale.termsIds).flat();

        const mandateTermsRef = await Promise.all(mandateTermsIds.map(id => db.doc(`terms/${id}`).get()));
        mandateTerms = mandateTermsRef.map(ref => ref.data()) as Term<Timestamp>[];

        const salesTermsRef = await Promise.all(saleTermsIds.map(id => db.doc(`terms/${id}`).get()))
        saleTerms = salesTermsRef.map(ref => ref.data()) as Term<Timestamp>[];
        const d = await db.collection('terms').doc('HJvSSzBny8BHdFFoor4y').get();
    });

    it(`Mandate test (territory)
    Terms: 01/01/2022 - 06/30/2023
    Territory: South Korea
    Rights: Free TV
    Exclusive: No
    Expected result: Not licensed`, () => {
        const acMandateTerms = mandateTerms.map(parseTimestampsOnTerms);
        const acHasRights = isLicensed({
            duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, territories: ['south-korea'], medias: ['freeTv'], exclusive: false
        }, acMandateTerms);
        expect(acHasRights).toBe(false);
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No
    Expected result: Not licensed`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['afghanistan'], medias: ['freeTv'] },
            toDateAvails);
        expect(ACRights).toBe(false)
    });

    it(`Terms: 01/01/2028 - 06/30/2036
    Territory: France
    Rights: Planes
    Exclusive: No
    Expected result: Not licensed`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2036'), from: new Date('01/01/2028') }, exclusive: false, territories: ['france'], medias: ['planes'] },
            toDateAvails);
        expect(ACRights).toBe(false)
    });

    it(`Terms check (existing ended sale)
    Terms: 01/01/2033 - 06/30/2033
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateAvails);
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2033'), from: new Date('01/01/2033') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateSales);
            console.log(avails)
        expect(avails).toBe(true);
    });

    it(`Terms check (existing ongoing sale)
    Terms: 01/01/2029 - 06/30/2031
    Territory: Germany, Russia, Czech Republic
    Rights: Free TV
    Exclusive: Yes
    Expected result: Not available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2031'), from: new Date('01/01/2029') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const isRightPossible = filterSales(
            { duration: { to: new Date('06/30/2031'), from: new Date('01/01/2019') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateSales);
        expect(isRightPossible).toBe(false);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: No
        Expected result: Available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateSales);
        expect(avails).toBe(true);
    });

    it(`Cross territory check + exclusivity
        Terms: 01/01/2022 - 06/30/2022
        Territory: Germany, Russia, Czech Republic
        Rights: Free TV
        Exclusive: Yes
        Expected result: Not available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['germany', 'russia', 'czech'], medias: ['freeTv'] },
            toDateSales);
        expect(!avails).toBe(false);
    });

    it(`Rights check
      Terms: 01/01/2022 - 06/30/2022
      Territory: Argentina
      Rights: S-VOD
      Exclusive: Yes
      Expected result: Available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['sVod'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['sVod'] },
            toDateSales);
        expect(avails).toBe(true);
    });


    it(`Rights check
    Terms: 01/01/2022 - 06/30/2022
    Territory: Argentina
    Rights: Pay TV
    Exclusive: Yes
    Expected result: Not available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['payTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: true, territories: ['argentina'], medias: ['payTv'] },
            toDateSales);
            console.log(avails)
        expect(!avails).toBe(false);
    });

    it(` Exclusivity test (non exclusive)
      Terms: 01/01/2022 - 06/30/2022
      Territory: Germany
      Rights: Free TV
      Exclusive: No
      Expected result: Available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany'], medias: ['freeTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2022'), from: new Date('01/01/2022') }, exclusive: false, territories: ['germany'], medias: ['freeTv'] },
            toDateSales);
        expect(avails).toBe(true);
    });

    it(`Exclusivity test (exclusive)
      Terms: 01/01/2020 - 06/30/2020
      Territory: Canada
      Rights: Free TV
      Exclusive: Yes
      Expected result: Not available`, () => {
        const toDateAvails = mandateTerms.map(parseTimestampsOnTerms);
        const ACRights = isLicensed(
            { duration: { to: new Date('06/30/2020'), from: new Date('01/01/2020') }, exclusive: true, territories: ['canada'], medias: ['freeTv'] },
            toDateAvails)
        expect(ACRights).toBe(true);
        const toDateSales = saleTerms.map(parseTimestampsOnTerms);
        const avails = filterSales(
            { duration: { to: new Date('06/30/2020'), from: new Date('01/01/2020') }, exclusive: true, territories: ['canada'], medias: ['freeTv'] },
            toDateSales);
        expect(!avails).toBe(false);
    });
})

function parseTimestampsOnTerms(term: Term<Timestamp>): Term<Date> {
    const fromDate = term.duration.from.toDate()
    const toDate = term.duration.to.toDate()
    term.duration.from = fromDate as any;
    term.duration.to = toDate as any
    return term as any
}