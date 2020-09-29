import { Firestore } from '../types';

export async function upgrade(db: Firestore) {
  const orgs = await db.collection('orgs').get();
  const batch = db.batch();

  const newDefaults = {
    addresses: {
      main: {
        city: '',
        country: '',
        phoneNumber: '',
        region: '',
        street: '',
        zipCode: ''
      }
    },
    logo: {
      originalRef: '',
      ref: '',
      url: ''
    },
    bankAccounts: [
      {
        BIC: '',
        IBAN: '',
        holderName: '',
        name: '',
        address: {
          city: '',
          country: '',
          phoneNumber: '',
          region: '',
          street: '',
          zipCode: ''
        }
      }
    ],
    wishlist: [],
    cart: [],
    isBlockchainEnabled: false
  };

  orgs.docs.forEach(x => {
    batch.update(x.ref, newDefaults);
  });

  return await batch.commit();
}
