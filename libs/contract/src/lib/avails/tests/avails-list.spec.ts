import { availableTitle } from '../avails';
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
import { assetArray } from './utils';

const mandatesMovie2 = [mandate1Movie2, mandate2Movie2];
const mandatesMovie3 = [mandate1Movie3, mandate2Movie3];

const movie1Sales = [
  saleArgentinaMovie1, saleGermanyMovie1,
  saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1
];
const movie2Sales = [
  saleAfghanistanMovie2, saleWorldMovie2,
  saleGermanyMovie2, saleSpainPortugalAustriaMovie2
];
const movie3Sales = [saleGermanyMovie3, saleArgentinaMovie3, saleFranceMovie3];
const movie4Sales = [saleSouthKoreaMovie4, saleRussiaMovie4, saleGermanyMovie4];
const movie5Sales = [saleAfghanistanMovie5, saleGermanyMovie5];

describe('Avails data', () => {
  it('tests availability on south-korea', () => {
    const movie1Mandates = availableTitle(availsListSouthKorea, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListSouthKorea, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListSouthKorea, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListSouthKorea, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListSouthKorea, [mandateMovie5], movie5Sales);
    const provided = [
      movie2Mandates.length, movie1Mandates.length,
      movie3Mandates.length, movie5Mandates.length,
      movie4Mandates.length
    ];
    assetArray(provided, [1, 0, 0, 0, 0])
  });

  it('tests duration on Afghanistan', () => {
    const movie1Mandates = availableTitle(availsListAfghanistan, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListAfghanistan, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListAfghanistan, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListAfghanistan, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListAfghanistan, [mandateMovie5], movie5Sales);
    const provided = [
      movie3Mandates.length, movie1Mandates.length,
      movie2Mandates.length, movie5Mandates.length,
      movie4Mandates.length
    ];
    assetArray(provided, [1, 0, 0, 0, 0]);
  });

  it('tests rights on france', () => {
    const movie1Mandates = availableTitle(availsListFrance, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListFrance, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListFrance, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListFrance, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListFrance, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [0, 0, 1, 1, 1]);
  });

  it('tests ended sales', () => {
    const movie1Mandates = availableTitle(availsListGermanyRussiaCzech, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListGermanyRussiaCzech, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListGermanyRussiaCzech, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListGermanyRussiaCzech, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListGermanyRussiaCzech, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [1, 0, 1, 0, 1])
  });

  it('tests ongoing sales request exclusive', () => {
    const movie1Mandates = availableTitle(availsListOngoingSalesExclusive, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListOngoingSalesExclusive, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListOngoingSalesExclusive, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListOngoingSalesExclusive, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListOngoingSalesExclusive, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [0, 1, 1, 1, 1]);
  });

  it('tests ongoing sales request non exclusive', () => {
    const movie1Mandates = availableTitle(availsListOngoingSalesNonExclusive, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListOngoingSalesNonExclusive, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListOngoingSalesNonExclusive, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListOngoingSalesNonExclusive, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListOngoingSalesNonExclusive, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length,
      movie2Mandates.length,
      movie3Mandates.length,
      movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [1, 1, 0, 1, 0]);
  });

  it('tests territory with exclusivity', () => {
    const movie1Mandates = availableTitle(availsListGermanyRussiaCzechExclusive, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListGermanyRussiaCzechExclusive, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListGermanyRussiaCzechExclusive, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListGermanyRussiaCzechExclusive, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListGermanyRussiaCzechExclusive, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [0, 1, 0, 0, 0]);
  });

  it('tests media (svod) on argentina ', () => {
    const movie1Mandates = availableTitle(availsListArgentinaSVod, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListArgentinaSVod, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListArgentinaSVod, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListArgentinaSVod, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListArgentinaSVod, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [1, 1, 0, 1, 1]);
  });

  it('tests media(payTv) on argentina', () => {
    const movie1Mandates = availableTitle(availsListArgentinaPayTV, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListArgentinaPayTV, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListArgentinaPayTV, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListArgentinaPayTV, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListArgentinaPayTV, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [0, 1, 1, 1, 1]);
  });

  it('tests non-exclusivity on Germany', () => {
    const movie1Mandates = availableTitle(availsListGermany, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListGermany, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListGermany, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListGermany, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListGermany, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [1, 1, 0, 1, 0]);
  });

  it('tests exclusivity on canada', () => {
    const movie1Mandates = availableTitle(availsListCanada, [mandateMovie1], movie1Sales);
    const movie2Mandates = availableTitle(availsListCanada, mandatesMovie2, movie2Sales);
    const movie3Mandates = availableTitle(availsListCanada, mandatesMovie3, movie3Sales);
    const movie4Mandates = availableTitle(availsListCanada, [mandateMovie4], movie4Sales);
    const movie5Mandates = availableTitle(availsListCanada, [mandateMovie5], movie5Sales);
    const provided = [
      movie1Mandates.length, movie2Mandates.length,
      movie3Mandates.length, movie4Mandates.length,
      movie5Mandates.length
    ];
    assetArray(provided, [0, 1, 1, 1, 1]);
  });
})
