import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import {
  DistributorStatement,
  FinancierStatement,
  ProducerStatement,
  createDistributorStatement,
  createFinancierStatement,
  createProducerStatement,
  createStatement
} from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class StatementService extends BlockframesSubCollection<ProducerStatement | DistributorStatement | FinancierStatement> {
  readonly path = 'waterfall/:waterfallId/statements';

  protected override fromFirestore(snapshot: DocumentSnapshot<ProducerStatement | DistributorStatement | FinancierStatement>) {
    if (!snapshot.exists()) return undefined;
    const statement = super.fromFirestore(snapshot);
    return createStatement(statement);
  }

  fixtures(waterfallId: string) {
    // Test Fixtures:
    const statement_1 = createDistributorStatement({
      id: 'statement_1',
      waterfallId,
      rightholderId: 'akTJNIHoFaCcMMnUZzOG', // playtime
      contractId: 'playtime_rf',
      duration: {
        from: new Date('2016-06-01'),
        to: new Date('2016-12-31')
      },
      incomeIds: ['cine_1', 'tv_1'], // TODO #9493 statement should create income from form values
      expenseIds: ['expense_fr_1'],  // TODO #9493 statement should create exoense from form values
      payments: {
        internal: [
          {
            id: 'internal_payment_1',
            type: 'internal',
            price: 750,
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_com_cine'
          },
          {
            id: 'internal_payment_2',
            type: 'internal',
            price: 1875,
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_expenses_cine'
          },
          {
            id: 'internal_payment_3',
            type: 'internal',
            price: 1000,
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_com_tv'
          },
          {
            id: 'internal_payment_4',
            type: 'internal',
            price: 1200,
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_expenses_tv'
          },
          {
            id: 'internal_payment_5',
            type: 'internal',
            price: 467.5, // TODO #9493 Sum of the two incomes, or two separate payments ?
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_mg_a'
          },
        ],
        external: {
          id: 'external_payment_1',
          type: 'external',
          price: 4707.5,
          currency: 'EUR',
          date: new Date('2016-12-31'),
          status: 'processed', // TODO #9493 external payments should be pending, until licensor make a bill and ack the paiement, changing status to processed
          to: 'kplH9Fyq5RygF0wQ7xlr', // rf
          incomeIds: ['cine_1', 'tv_1']
        }
      }
    });

    const statement_2 = createProducerStatement({
      id: 'statement_2',
      waterfallId,
      rightholderId: 'kplH9Fyq5RygF0wQ7xlr', // rf
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2017-01-01'),
        to: new Date('2017-05-31')
      },
      incomeIds: ['cine_1', 'tv_1'],
      payments: {
        internal: [
          {
            id: 'internal_payment_1',
            type: 'internal',
            price: 4207.50,
            currency: 'EUR',
            date: new Date('2017-05-31'),
            status: 'processed',
            to: 'rf_rest'
          },
        ],
        external: {
          id: 'external_payment_1',
          type: 'external',
          price: 500,
          currency: 'EUR',
          date: new Date('2017-05-31'),
          status: 'processed',
          to: '6ocSmkz3JcZD9P6GGcYL', // soficinema
          incomeIds: ['cine_1']
        }
      }
    });

    const statement_3 = createFinancierStatement({ // TODO #9493 this should not be a stament
      id: 'statement_3',
      waterfallId,
      rightholderId: '6ocSmkz3JcZD9P6GGcYL', // soficinema
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2017-01-01'),
        to: new Date('2017-05-31')
      },
      incomeIds: ['cine_1'],
      payments: {
        internal: [
          {
            id: 'internal_payment_1',
            type: 'internal',
            price: 500,
            currency: 'EUR',
            date: new Date('2017-05-31'),
            status: 'processed',
            to: 'soficinema_corridor'
          },
        ],
      }
    });

    const statement_4 = createDistributorStatement({
      id: 'statement_4',
      waterfallId,
      rightholderId: 'akTJNIHoFaCcMMnUZzOG', // playtime
      contractId: 'playtime_rf',
      duration: {
        from: new Date('2018-06-01'),
        to: new Date('2018-12-31')
      },
      incomeIds: ['cine_2'],
      expenseIds: [],
      payments: {
        internal: [
          {
            id: 'internal_payment_1',
            type: 'internal',
            price: 750,
            currency: 'EUR',
            date: new Date('2018-12-31'),
            status: 'processed',
            to: 'playtime_com_cine'
          },
          {
            id: 'internal_payment_2',
            type: 'internal',
            price: 1875,
            currency: 'EUR',
            date: new Date('2018-12-31'),
            status: 'processed',
            to: 'playtime_expenses_cine'
          },
          {
            id: 'internal_payment_3',
            type: 'internal',
            price: 187.5,
            currency: 'EUR',
            date: new Date('2018-12-31'),
            status: 'processed',
            to: 'playtime_mg_b'
          },
        ],
        external: {
          id: 'external_payment_1',
          type: 'external',
          price: 2187.5,
          currency: 'EUR',
          date: new Date('2018-12-31'),
          status: 'processed',
          to: 'kplH9Fyq5RygF0wQ7xlr', // rf
          incomeIds: ['cine_2']
        }
      }
    });

    const statement_5 = createProducerStatement({
      id: 'statement_5',
      waterfallId,
      rightholderId: 'kplH9Fyq5RygF0wQ7xlr', // rf
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2018-06-01'),
        to: new Date('2018-12-31')
      },
      incomeIds: ['cine_2'],
      payments: {
        internal: [
          {
            id: 'internal_payment_1',
            type: 'internal',
            price: 500,
            currency: 'EUR',
            date: new Date('2018-12-31'),
            status: 'processed',
            to: 'rf_corridor'
          },
          {
            id: 'internal_payment_2',
            type: 'internal',
            price: 1687.5,
            currency: 'EUR',
            date: new Date('2018-12-31'),
            status: 'processed',
            to: 'rf_rest'
          },
        ],
        external: {
          id: 'external_payment_1',
          type: 'external',
          price: 0,
          currency: 'EUR',
          date: new Date('2017-05-31'),
          status: 'processed',
          to: '6ocSmkz3JcZD9P6GGcYL', // soficinema
          incomeIds: ['cine_2']
        }
      }
    });

    return Promise.all([
      this.add<DistributorStatement>([statement_1, statement_4], { params: { waterfallId } }),
      this.add<ProducerStatement>([statement_2, statement_5], { params: { waterfallId } }),
      this.add<FinancierStatement>(statement_3, { params: { waterfallId } }),
    ]);
  }
}
