import { availableTitle, AvailsFilter, FullMandate, FullSale } from '../avails';
import {
  availsListSouthKorea, availsListAfghanistan, availsListFrance, availsListGermanyRussiaCzech,
  availsListOngoingSalesExclusive, availsListOngoingSalesNonExclusive, availsListGermanyRussiaCzechExclusive,
  availsListArgentinaSVod, availsListArgentinaPayTV, availsListGermany, availsListCanada
} from './../fixtures/availsFilters';
import {
  mandate1Movie2, mandate1Movie3, mandate2Movie2, mandateMovie1, mandate2Movie3, mandateMovie4, mandateMovie5,
  saleArgentinaMovie1, saleGermanyMovie1, saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1,
  saleAfghanistanMovie2, saleWorldMovie2, saleGermanyMovie2, saleSpainPortugalAustriaMovie2,
  saleGermanyMovie3, saleArgentinaMovie3, saleFranceMovie3,
  saleSouthKoreaMovie4, saleRussiaMovie4, saleGermanyMovie4,
  saleAfghanistanMovie5, saleGermanyMovie5
} from './../fixtures/mandatesAndSales';
import { assertArray } from './utils';

type LengthResult = [number, number, number, number, number];

//The rows of mandates and sales should correspond to the same movie.
const movieMandates = [
  [mandateMovie1],
  [mandate1Movie2, mandate2Movie2],
  [mandate1Movie3, mandate2Movie3],
  [mandateMovie4],
  [mandateMovie5],
];
const movieSales = [
  [saleArgentinaMovie1, saleGermanyMovie1, saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1],
  [saleAfghanistanMovie2, saleWorldMovie2, saleGermanyMovie2, saleSpainPortugalAustriaMovie2],
  [saleGermanyMovie3, saleArgentinaMovie3, saleFranceMovie3],
  [saleSouthKoreaMovie4, saleRussiaMovie4, saleGermanyMovie4],
  [saleAfghanistanMovie5, saleGermanyMovie5]
];

function assertTitleAvailability(avail: AvailsFilter, mandates: FullMandate[][], sales: FullSale[][], result: LengthResult) {
  const availableMandates = mandates.map((mandate, index) => availableTitle(avail, mandate, sales[index]));
  const availabilitiesLength = availableMandates.map(mandate => mandate.length);
  assertArray(availabilitiesLength, result);
}

describe('Avails data', () => {
  it('tests availability on south-korea', () => {
    assertTitleAvailability(availsListSouthKorea, movieMandates, movieSales, [0, 1, 0, 0, 0])
  });

  it('tests duration on Afghanistan', () => {
    assertTitleAvailability(availsListAfghanistan, movieMandates, movieSales, [0, 0, 1, 0, 0]);
  });

  it('tests rights on france', () => {
    assertTitleAvailability(availsListFrance, movieMandates, movieSales, [0, 0, 1, 1, 1]);
  });

  it('tests ended sales', () => {
    assertTitleAvailability(availsListGermanyRussiaCzech, movieMandates, movieSales, [3, 0, 3, 0, 3]);
  });

  it('tests ongoing sales request exclusive', () => {
    assertTitleAvailability(availsListOngoingSalesExclusive, movieMandates, movieSales, [0, 3, 3, 3, 3]);
  });

  it('tests ongoing sales request non exclusive', () => {
    assertTitleAvailability(availsListOngoingSalesNonExclusive, movieMandates, movieSales, [3, 3, 0, 3, 0]);
  });

  it('tests territory with exclusivity', () => {
    assertTitleAvailability(availsListGermanyRussiaCzechExclusive, movieMandates, movieSales, [0, 3, 0, 0, 0]);
  });

  it('tests media (svod) on argentina ', () => {
    assertTitleAvailability(availsListArgentinaSVod, movieMandates, movieSales, [1, 1, 0, 1, 1]);
  });

  it('tests media(payTv) on argentina', () => {
    assertTitleAvailability(availsListArgentinaPayTV, movieMandates, movieSales, [0, 1, 1, 1, 1]);
  });

  it('tests non-exclusivity on Germany', () => {
    assertTitleAvailability(availsListGermany, movieMandates, movieSales, [1, 1, 0, 1, 0,]);
  });

  it('tests exclusivity on canada', () => {
    assertTitleAvailability(availsListCanada, movieMandates, movieSales, [0, 1, 1, 1, 1]);
  });
})
