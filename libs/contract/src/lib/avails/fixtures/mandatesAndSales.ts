import { createMandate, createSale } from "@blockframes/contract/contract/+state";
import { territories, Territory } from "@blockframes/utils/static-model";
import { FullMandate, FullSale } from "../avails";

/**
 * AVAILS AND SALES ARE GOTTEN FROM HERE.
 * https://docs.google.com/spreadsheets/d/1YAsKVdFt_ybheXlLJsKoXYdlma-iB1W_ilKPTuHME2w/edit#gid=989765594
 */

export const allButSouthKorea = Object.keys(territories).filter((territory) => territory !== 'south-korea') as Territory[];

export const mandateMovie1 = {
  ...createMandate({
    titleId: 'Movie1',
    id: 'mandateMovie1',
    termIds: ['termMandate1'],
  }),
  terms: [{
    id: 'termMandate1',
    contractId: 'mandateMovie1',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2035')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video', 'hotels', 'educational', 'rental', 'through'],
    territories: allButSouthKorea,
    exclusive: true
  }],
} as FullMandate;

export const saleArgentinaMovie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'saleArgentinaMovie1',
    termIds: ['termSaleArgentinaMovie1'],
  }),
  terms: [{
    id: 'termSaleArgentinaMovie1',
    contractId: 'saleArgentinaMovie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'video'],
    territories: ['argentina'],
    exclusive: true
  }],
} as FullSale;

export const saleGermanyMovie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'saleGermanyMovie1',
    termIds: ['termSaleGermanyMovie1'],
  }),
  terms: [{
    id: 'termSaleGermanyMovie1',
    contractId: 'saleGermanyMovie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video'],
    territories: ['germany'],
    exclusive: false
  }],
} as FullSale;

export const saleCanadaMovie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'saleCanadaMovie1',
    termIds: ['termSaleCanadaMovie1'],
  }),
  terms: [{
    id: 'termSaleCanadaMovie1',
    contractId: 'saleCanadaMovie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video'],
    territories: ['canada'],
    exclusive: false
  }],
} as FullSale;

export const saleBelgiumFranceLuxembourgMovie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'saleBelgiumFrnaceLuxembourgMovie1',
    termIds: ['termSaleBelgiumFrnaceLuxembourgMovie1']
  }),
  terms: [{
    id: 'termSaleBelgiumFrnaceLuxembourgMovie1',
    contractId: 'saleBelgiumFrnaceLuxembourgMovie1',
    duration: {
      from: new Date('01/01/2031'),
      to: new Date('12/31/2032')
    },
    medias: ['sVod'],
    territories: ['belgium', 'france', 'luxembourg'],
    exclusive: true
  }],
} as FullSale;
