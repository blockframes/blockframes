import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Expense, Income, PricePerCurrency, Statement, Term, Waterfall, WaterfallDocument, isContract, sum } from '@blockframes/model';

/**
 * Removes unused currency and price attributes
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await updateWaterfall(db);
  await updateIncomes(db);
  await updateExpenses(db);
  return updateTerms(db);
}

function convertCurrencies(price: PricePerCurrency = {}): number {
  return sum(Object.values(price));
}

async function updateWaterfall(db: Firestore) {
  const waterfalls = await db.collection('waterfall').get();

  for (const doc of waterfalls.docs) {
    const waterfall = doc.data() as Waterfall;

    // Set mainCurrency to 'EUR'
    waterfall.mainCurrency = 'EUR';

    // Remove 'currency' attribute on expense types
    for (const [key, expenses] of Object.entries(waterfall.expenseTypes)) {

      const cleanedExpenses = expenses.map(expense => {
        delete (expense as any).currency;
        return expense;
      });

      waterfall.expenseTypes[key] = cleanedExpenses;
    }

    await doc.ref.set(waterfall);

    const documents = await doc.ref.collection('documents').get();

    await runChunks(documents.docs, async (waterfallDoc) => {
      const waterfallDocument = waterfallDoc.data() as WaterfallDocument;

      if (isContract(waterfallDocument)) {
        // Remove 'currency' attribute, 
        delete (waterfallDocument.meta as any).currency;
        await waterfallDoc.ref.set(waterfallDocument);
      }
    });

    const statements = await doc.ref.collection('statements').get();

    await runChunks(statements.docs, async (statementDoc) => {
      const statementDocument = statementDoc.data() as Statement;

      if (statementDocument.payments) {
        if (statementDocument.payments.income) {
          statementDocument.payments.income = statementDocument.payments.income.map(i => {
            delete (i as any).currency;
            return i;
          });
        }

        if (statementDocument.payments.right) {
          statementDocument.payments.right = statementDocument.payments.right.map(i => {
            delete (i as any).currency;
            return i;
          });
        }

        if (statementDocument.payments.rightholder) {
          delete (statementDocument.payments.rightholder as any).currency;
        }
      }

      if (statementDocument.reportedData?.expensesPerDistributor) {
        for (const [key, expensesPerDistributor] of Object.entries(statementDocument.reportedData.expensesPerDistributor)) {
          statementDocument.reportedData.expensesPerDistributor[key] = expensesPerDistributor.map(e => {
            if (e.cap) {
              e.cap = convertCurrencies(e.cap as PricePerCurrency);
            }

            return e;
          });
        }
      }

      if (statementDocument.reportedData?.sourcesBreakdown) {
        statementDocument.reportedData.sourcesBreakdown = statementDocument.reportedData.sourcesBreakdown.map(s => {
          s.rows = s.rows.map(r => {
            if (r.cap) {
              r.cap = convertCurrencies(r.cap as PricePerCurrency);
            }

            r.cumulated = convertCurrencies(r.cumulated as PricePerCurrency);
            r.current = convertCurrencies(r.current as PricePerCurrency);
            r.previous = convertCurrencies(r.previous as PricePerCurrency);
            return r;
          });
          s.stillToBeRecouped = convertCurrencies(s.stillToBeRecouped as PricePerCurrency);
          s.net = convertCurrencies(s.net as PricePerCurrency);
          if (s.mgStatus) {
            s.mgStatus.investments = convertCurrencies(s.mgStatus.investments as PricePerCurrency);
            s.mgStatus.stillToBeRecouped = convertCurrencies(s.mgStatus.stillToBeRecouped as PricePerCurrency);
          }
          return s;
        });
      }

      if (statementDocument.reportedData?.rightsBreakdown) {
        statementDocument.reportedData.rightsBreakdown = statementDocument.reportedData.rightsBreakdown.map(s => {
          s.rows = s.rows.map(r => {
            if (r.cap) {
              r.cap = convertCurrencies(r.cap as PricePerCurrency);
            }
            r.cumulated = convertCurrencies(r.cumulated as PricePerCurrency);
            r.current = convertCurrencies(r.current as PricePerCurrency);
            r.previous = convertCurrencies(r.previous as PricePerCurrency);
            return r;
          });
          s.stillToBeRecouped = convertCurrencies(s.stillToBeRecouped as PricePerCurrency);
          s.total = convertCurrencies(s.total as PricePerCurrency);
          if (s.mgStatus) {
            s.mgStatus.investments = convertCurrencies(s.mgStatus.investments as PricePerCurrency);
            s.mgStatus.stillToBeRecouped = convertCurrencies(s.mgStatus.stillToBeRecouped as PricePerCurrency);
          }
          return s;
        });
      }

      if (statementDocument.reportedData?.expenses) {
        statementDocument.reportedData.expenses = statementDocument.reportedData.expenses.map(e => {
          delete (e as any).currency;
          return e;
        });
      }

      if (statementDocument.reportedData?.distributorExpenses) {
        statementDocument.reportedData.distributorExpenses = statementDocument.reportedData.distributorExpenses.map(e => {
          e.rows = e.rows.map(r => {
            r.cumulated = convertCurrencies(r.cumulated as PricePerCurrency);
            r.current = convertCurrencies(r.current as PricePerCurrency);
            r.previous = convertCurrencies(r.previous as PricePerCurrency);
            return r;
          });
          return e;
        })
      }

      if (statementDocument.reportedData?.distributorExpensesPerDistributor) {
        for (const [key, distributorExpensesPerDistributor] of Object.entries(statementDocument.reportedData.distributorExpensesPerDistributor)) {
          statementDocument.reportedData.distributorExpensesPerDistributor[key] = distributorExpensesPerDistributor.map(e => {
            e.rows = e.rows.map(r => {
              r.cumulated = convertCurrencies(r.cumulated as PricePerCurrency);
              r.current = convertCurrencies(r.current as PricePerCurrency);
              r.previous = convertCurrencies(r.previous as PricePerCurrency);
              return r;
            });
            return e;
          });
        }
      }

      if (statementDocument.reportedData?.producerNetParticipation) {
        statementDocument.reportedData.producerNetParticipation = convertCurrencies(statementDocument.reportedData.producerNetParticipation as PricePerCurrency);
      }

      await statementDoc.ref.set(statementDocument);
    });
  }
}

async function updateTerms(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async (doc) => {
    const term = doc.data() as Term;

    // Remove attribute: 'price', 'currency'
    delete (term as any).price;
    delete (term as any).currency;

    await doc.ref.set(term);
  }).catch(err => console.error(err));
}

async function updateIncomes(db: Firestore) {
  const incomes = await db.collection('incomes').get();

  return runChunks(incomes.docs, async (doc) => {
    const income = doc.data() as Income;

    if (!income.offerId) { // IE : Waterfall income
      delete (income as any).currency;
      await doc.ref.set(income);
    }

  }).catch(err => console.error(err));
}

async function updateExpenses(db: Firestore) {
  const expenses = await db.collection('expenses').get();

  return runChunks(expenses.docs, async (doc) => {
    const expense = doc.data() as Expense;
    delete (expense as any).currency;
    await doc.ref.set(expense);
  }).catch(err => console.error(err));
}