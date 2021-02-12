import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import {
    AngularFirestoreModule,
    AngularFirestore,
    USE_EMULATOR as USE_FIRESTORE_EMULATOR
} from '@angular/fire/firestore';
import { firebase as config } from '@env';
import { Mandate, Sale } from '../contract/+state/contract.model';
import { Term } from '../term/+state/term.model';
import { getAvails, filterAvail } from './avails';
import type firebase from 'firebase';

export type Timestamp = firebase.firestore.Timestamp;

describe('Avails', () => {
    const titleId = 'Cr3NYe9RXaMwP98LQMyD';
    let fire: AngularFirestore;
    let contracts;
    let mandateTerms: Term<Timestamp>[];
    let saleTerms: Term<Timestamp>[];

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                AngularFireModule.initializeApp(config()),
                AngularFirestoreModule
            ],
            providers: [
                { provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] }
            ]
        })

        fire = TestBed.inject(AngularFirestore);

        const contractsRef = await fire.collection('contracts', ref => ref.where('titleId', '==', titleId)).get().toPromise();
        contracts = contractsRef.docs.map(ref => ref.data() as (Mandate | Sale));
        const mandates = contracts.filter((contract: Mandate) => contract.type === 'mandate') as Mandate[]
        const sales = contracts.filter((contract: Sale) => contract.type === 'sale') as Sale[]

        const mandateTermsIds = mandates.map(mandate => mandate.termsIds).flat();
        const saleTermsIds = sales.map(sale => sale.termsIds).flat();

        const mandateTermsRef = await Promise.all(mandateTermsIds.map(id => fire.doc(`terms/${id}`).get().toPromise()));
        mandateTerms = mandateTermsRef.map(ref => ref.data()) as Term<Timestamp>[]

        const salesTermsRef = await Promise.all(saleTermsIds.map(id => fire.doc(`terms/${id}`).get().toPromise()))
        saleTerms = salesTermsRef.map(ref => ref.data()) as Term<Timestamp>[]
    });

    it(`Mandate test (territory)
    Terms: 01/01/2022 - 06/30/2023
    Territory: South Korea
    Rights: Free TV
    Exclusive: No
    Expected result: NOT LICENSED`, () => {
        const avails = getAvails({ mandateTerms, saleTerms });
        const toDateAvails = avails.map(avail => {
            const fromDate = avail.duration.from.toDate()
            const toDate = avail.duration.to.toDate()
            avail.duration.from = fromDate as any;
            avail.duration.to = toDate as any
            return avail as any
        })
        const licensed = filterAvail({
            duration: { to: new Date('06/30/2023'), from: new Date('01/01/2022') }, territories: ['south-korea'], medias: ['freeTv'], exclusive: false
        }, toDateAvails);
        expect(licensed).toBe(false);
    })

    it(`Mandate test (terms)
    Terms: 01/01/2028 - 06/30/2036
    Territory: Afghanistan
    Rights: Free TV
    Exclusive: No`, () => {
        
    })
})