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
      rightholderId: 'bummjvVnBZfzI9G1Too2', // playtime
      contractId: 'playtime_rf',
      duration: {
        from: new Date('2016-06-01'),
        to: new Date('2016-12-31')
      },
      incomes: [
        {
          incomeId: 'cine_1', // TODO #9493 statement should create income from form values
          rights: {
            1: 'playtime_com_cine',
            2: 'playtime_expenses_cine',
            3: 'playtime_mg'
          }
        },
        {
          incomeId: 'tv_1', // TODO #9493 statement should create income from form values
          rights: {
            1: 'playtime_com_tv',
            2: 'playtime_expenses_tv',
            3: 'playtime_mg'
          }
        }
      ],
      expenseIds: ['expense_fr_1'],
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
            price: 467.5, // TODO #9493 Sum of the two incomes, on two separate payments ?
            currency: 'EUR',
            date: new Date('2016-12-31'),
            status: 'processed',
            to: 'playtime_mg'
          },
        ],
        external: { // TODO #9493 should be generated automatically: sum(incomes) - sum(internal_payments)
          id: 'external_payment_1',
          type: 'external',
          price: 4707.5,
          currency: 'EUR',
          date: new Date('2016-12-31'),
          status: 'processed', // TODO #9493 should be pending, until licensor make a bill and ack the paiement, changing status to processed
          to: '4jBJ72Twytd3Hq03zUxQ' // rf
        }
      }
    });

    const statement_2 = createProducerStatement({
      id: 'statement_2',
      waterfallId,
      rightholderId: '4jBJ72Twytd3Hq03zUxQ', // rf
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2017-01-01'),
        to: new Date('2017-05-31')
      },
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
          status: 'processed', // TODO #9493 should be pending, until licensor make a bill and ack the paiement, changing status to processed
          to: 'L0ulqmhAO7BRCR3eZtpD' // soficinema
        }
      }
    });

    const statement_3 = createFinancierStatement({
      id: 'statement_3',
      waterfallId,
      rightholderId: 'L0ulqmhAO7BRCR3eZtpD', // soficinema
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2017-01-01'),
        to: new Date('2017-05-31')
      },
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
      rightholderId: 'bummjvVnBZfzI9G1Too2', // playtime
      contractId: 'playtime_rf',
      duration: {
        from: new Date('2018-06-01'),
        to: new Date('2018-12-31')
      },
      incomes: [
        {
          incomeId: 'cine_2',
          rights: {
            1: 'playtime_com_cine',
            2: 'playtime_expenses_cine',
            3: 'playtime_mg'
          }
        },
      ],
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
            to: 'playtime_mg'
          },
        ],
        external: {
          id: 'external_payment_1',
          type: 'external',
          price: 2187.5,
          currency: 'EUR',
          date: new Date('2018-12-31'),
          status: 'processed',
          to: '4jBJ72Twytd3Hq03zUxQ' // rf
        }
      }
    });

    const statement_5 = createProducerStatement({
      id: 'statement_5',
      waterfallId,
      rightholderId: '4jBJ72Twytd3Hq03zUxQ', // rf
      contractId: 'rf_soficinema',
      duration: {
        from: new Date('2018-06-01'),
        to: new Date('2018-12-31')
      },
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
        ]
      }
    });

    return Promise.all([
      this.add<DistributorStatement>([statement_1, statement_4], { params: { waterfallId } }),
      this.add<ProducerStatement>([statement_2, statement_5], { params: { waterfallId } }),
      this.add<FinancierStatement>(statement_3, { params: { waterfallId } }),
    ]);
  }
}
