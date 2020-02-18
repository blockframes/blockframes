import { Firestore } from '../admin';
import { createPrice } from '@blockframes/utils/common-interfaces/price';

function convertPrice(price: any) {

  if (price.mg && price.mg.currency) {
    price.mg.currency = _convertCurrency(price.mg.currency);
  }

  if (price.currency) {
    price.currency = _convertCurrency(price.currency);
  }

  if (price.recoupableExpenses && price.recoupableExpenses.length) {
    for (let i = 0; i < price.recoupableExpenses.length; i++) {
      if (price.recoupableExpenses[i].price && price.recoupableExpenses[i].price.currency) {
        price.recoupableExpenses[i].price.currency = _convertCurrency(price.recoupableExpenses[i].price.currency);
      }

      if (price.recoupableExpenses[i].collected && price.recoupableExpenses[i].collected.currency) {
        price.recoupableExpenses[i].collected.currency = _convertCurrency(price.recoupableExpenses[i].collected.currency);
      }

      if (price.recoupableExpenses[i].payments && price.recoupableExpenses[i].payments.length) {
        for (let j = 0; j < price.recoupableExpenses[i].payments.length; j++) {
          if (price.recoupableExpenses[i].payments[j].price && price.recoupableExpenses[i].payments[j].price.currency) {
            price.recoupableExpenses[i].payments[j].price.currency = _convertCurrency(price.recoupableExpenses[i].payments[j].price.currency);
          }
        }
      }
    }
  }

  return createPrice(price);
}

function _convertCurrency(currency) {
  switch (currency) {
    case 'euro':
    default:
      return 'EUR'
  }
}

export async function updateContractVersionPrice(db: Firestore) {
  const versions = await db.collectionGroup('versions').get();

  const newVersionData = versions.docs.map(
    async (docSnapshot: any): Promise<any> => {
      const versionData = docSnapshot.data();
      const newData = { ...versionData };

      if (newData.price) {
        newData.price = convertPrice(newData.price);
        console.log(`versions > updated newData.price`);
      }

      if (newData.titles) {
        Object.keys(newData.titles).forEach(title => {
          if (newData.titles[title].price) {
            newData.titles[title].price = convertPrice(newData.titles[title].price);
            console.log(`versions > updated newData.titles[${title}].price`);
          }
        });
      }

      return docSnapshot.ref.set(newData);
    }
  );
  await Promise.all(newVersionData);
  console.log('Updating currency in contract versions documents done.');
}

export async function updateInvoicePrice(db: Firestore) {
  const invoices = await db.collectionGroup('invoices').get();

  const newVersionData = invoices.docs.map(
    async (docSnapshot: any): Promise<any> => {
      const versionData = docSnapshot.data();
      const newData = { ...versionData };

      if (newData.price) {
        newData.price = convertPrice(newData.price);
        console.log(`invoices > updated newData.price`);
      }

      if (newData.collected) {
        newData.collected = convertPrice(newData.collected);
        console.log(`invoices > updated newData.collected`);
      }

      if (newData.titles) {
        Object.keys(newData.titles).forEach(title => {
          if (newData.titles[title].price) {
            newData.titles[title].price = convertPrice(newData.titles[title].price);
            console.log(`invoices > updated newData.titles[${title}].price`);
          }
        });
      }

      if (newData.payments && newData.payments.length) {
        for (let i = 0; i < newData.payments.length; i++) {
          if (newData.payments[i].price && newData.payments[i].price.currency) {
            newData.payments[i].price.currency = _convertCurrency(newData.payments[i].price.currency);
          }
        }
      }

      return docSnapshot.ref.set(newData);
    }
  );
  await Promise.all(newVersionData);
  console.log('Updating currency in invoice documents done.');
}

export async function upgrade(db: Firestore) {
  await updateContractVersionPrice(db);
  await updateInvoicePrice(db);
}
