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

export const sale1Movie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'sale1Movie1',
    termIds: ['termSale1Movie1'],
  }),
  terms: [{
    id: 'termSale1Movie1',
    contractId: 'sale1Movie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'video'],
    territories: ['argentina'],
    exclusive: true
  }],
} as FullSale;

export const sale2Movie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'sale2Movie1',
    termIds: ['termSale2Movie1'],
  }),
  terms: [{
    id: 'termSale2Movie1',
    contractId: 'sale2Movie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video'],
    territories: ['germany'],
    exclusive: false
  }],
} as FullSale;

export const sale3Movie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'sale3Movie1',
    termIds: ['termSale3Movie1'],
  }),
  terms: [{
    id: 'termSale3Movie1',
    contractId: 'sale3Movie1',
    duration: {
      from: new Date('06/01/2019'),
      to: new Date('12/31/2030')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video'],
    territories: ['canada'],
    exclusive: false
  }],
} as FullSale;

export const sale4Movie1 = {
  ...createSale({
    status: 'accepted',
    titleId: 'Movie1',
    id: 'sale4Movie1',
    termIds: ['termSale4Movie1']
  }),
  terms: [{
    id: 'termSale4Movie1',
    contractId: 'sale4Movie1',
    duration: {
      from: new Date('01/01/2031'),
      to: new Date('12/31/2032')
    },
    medias: ['sVod'],
    territories: ['belgium', 'france', 'luxembourg'],
    exclusive: true
  }],
} as FullSale;
