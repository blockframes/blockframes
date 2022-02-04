import { createMandate, createSale } from "@blockframes/contract/contract/+state";
import { territories, Territory } from "@blockframes/utils/static-model";
import { FullMandate, FullSale } from "../avails";

/**
 * AVAILS AND SALES ARE GOTTEN FROM HERE.
 * https://docs.google.com/spreadsheets/d/1YAsKVdFt_ybheXlLJsKoXYdlma-iB1W_ilKPTuHME2w/edit#gid=989765594
 */

export const allButSouthKorea = Object.keys(territories).filter((territory) => territory !== 'south-korea') as Territory[];
export const world = Object.keys(territories) as Territory[];

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


export const mandate1Movie2 = {
  ...createMandate({
    titleId: 'Movie2',
    id: 'mandateMovie2',
    termIds: ['termMandateMovie2'],
  }),
  terms: [{
    id: 'termMandateMovie2',
    contractId: 'mandateMovie2',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2040')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'fVod', 'sVod', 'video', 'hotels', 'planes'],
    territories: world,
    exclusive: true
  }],
} as FullMandate;

export const mandate2Movie2 = {
  ...createMandate({
    titleId: 'Movie2',
    id: 'mandate1Movie2',
    termIds: ['termMandate1Movie2'],
  }),
  terms: [{
    id: 'termMandate1Movie2',
    contractId: 'mandate1Movie2',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2040')
    },
    medias: ['aVod'],
    territories: world,
    exclusive: true
  }],
} as FullMandate;

export const saleAfghanistanMovie2 = {
  ...createSale({
    titleId: 'Movie2',
    id: 'saleAfghanistanMovie2',
    termIds: ['termsaleAfghanistanMovie2'],
  }),
  terms: [{
    id: 'termsaleAfghanistanMovie2',
    contractId: 'saleAfghanistanMovie2',
    duration: {
      from: new Date('06/01/2022'),
      to: new Date('01/01/2023')
    },
    medias: ['freeTv'],
    territories: ['afghanistan'],
    exclusive: true
  }],
} as FullSale;

export const saleWorldMovie2 = {
  ...createSale({
    titleId: 'Movie2',
    id: 'saleWorldMovie2',
    termIds: ['termsaleWorldMovie2'],
  }),
  terms: [{
    id: 'termsaleWorldMovie2',
    contractId: 'saleWorldMovie2',
    duration: {
      from: new Date('06/01/2022'),
      to: new Date('01/01/2029')
    },
    medias: ['planes'],
    territories: world,
    exclusive: true
  }],
} as FullSale;

export const saleGermanyMovie2 = {
  ...createSale({
    titleId: 'Movie2',
    id: 'saleGermanyMovie2',
    termIds: ['termsaleGermanyMovie2'],
  }),
  terms: [{
    id: 'termsaleGermanyMovie2',
    contractId: 'saleGermanyMovie2',
    duration: {
      from: new Date('06/01/2033'),
      to: new Date('01/01/2035')
    },
    medias: ['freeTv'],
    territories: ['germany'],
    exclusive: false
  }],
} as FullSale;

export const saleSpainPortugalAustriaMovie2 = {
  ...createSale({
    titleId: 'Movie2',
    id: 'saleGermanyMovie2',
    termIds: ['termsaleGermanyMovie2'],
  }),
  terms: [{
    id: 'termsaleGermanyMovie2',
    contractId: 'saleGermanyMovie2',
    duration: {
      from: new Date('06/01/2033'),
      to: new Date('01/01/2035')
    },
    medias: ['aVod'],
    territories: ['spain', 'portugal', 'austria'],
    exclusive: true
  }],
} as FullSale;


export const mandateMovie3 = {
  ...createMandate({
    titleId: 'Movie3',
    id: 'mandateMovie3',
    termIds: ['termMandateMovie3'],
  }),
  terms: [{
    id: 'termMandateMovie3',
    contractId: 'mandateMovie3',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2040')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video', 'hotels', 'planes'],
    territories: allButSouthKorea,
    exclusive: true
  }],
} as FullMandate;

export const mandate1Movie3 = {
  ...createMandate({
    titleId: 'Movie3',
    id: 'mandate1Movie3',
    termIds: ['termMandate1Movie3'],
  }),
  terms: [{
    id: 'termMandate1Movie3',
    contractId: 'mandate1Movie3',
    duration: {
      from: new Date('12/01/2040'),
      to: new Date('01/31/2050')
    },
    medias: ['sVod'],
    territories: ['france'],
    exclusive: true
  }],
} as FullMandate;

export const saleGermanyMovie3 = {
  ...createSale({
    titleId: 'Movie3',
    id: 'saleGermanyMovie3',
    termIds: ['termsaleGermanyMovie3'],
  }),
  terms: [{
    id: 'termsaleGermanyMovie3',
    contractId: 'saleGermanyMovie3',
    duration: {
      from: new Date('06/01/2021'),
      to: new Date('01/01/2023')
    },
    medias: ['freeTv'],
    territories: ['germany'],
    exclusive: true
  }],
} as FullSale;

export const saleArgentinaMovie3 = {
  ...createSale({
    titleId: 'Movie3',
    id: 'saleArgentinaMovie3',
    termIds: ['termsaleArgentinaMovie3'],
  }),
  terms: [{
    id: 'termsaleArgentinaMovie3',
    contractId: 'saleArgentinaMovie3',
    duration: {
      from: new Date('06/01/2021'),
      to: new Date('01/01/2023')
    },
    medias: ['sVod'],
    territories: ['argentina'],
    exclusive: false
  }],
} as FullSale;

export const saleFranceMovie3 = {
  ...createSale({
    titleId: 'Movie3',
    id: 'saleFranceMovie3',
    termIds: ['termsaleFranceMovie3'],
  }),
  terms: [{
    id: 'termsaleFranceMovie3',
    contractId: 'saleFranceMovie3',
    duration: {
      from: new Date('01/01/2049'),
      to: new Date('01/31/2050')
    },
    medias: ['sVod'],
    territories: ['france'],
    exclusive: false
  }],
} as FullSale;


export const mandateMovie4 = {
  ...createMandate({
    titleId: 'Movie4',
    id: 'mandateMovie4',
    termIds: ['termMandateMovie4'],
  }),
  terms: [{
    id: 'termMandateMovie4',
    contractId: 'mandateMovie4',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2035')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video', 'hotels', 'planes'],
    territories: world,
    exclusive: true
  }],
} as FullMandate;

export const saleSouthKoreaMovie4 = {
  ...createSale({
    titleId: 'Movie4',
    id: 'saleSouthKoreaMovie4',
    termIds: ['termsaleSouthKoreaMovie4'],
  }),
  terms: [{
    id: 'termsaleSouthKoreaMovie4',
    contractId: 'saleSouthKoreaMovie4',
    duration: {
      from: new Date('06/01/2022'),
      to: new Date('01/01/2023')
    },
    medias: ['freeTv'],
    territories: ['south-korea'],
    exclusive: true
  }],
} as FullSale;

export const saleRussiaMovie4 = {
  ...createSale({
    titleId: 'Movie4',
    id: 'saleRussiaMovie4',
    termIds: ['termsaleRussiaMovie4'],
  }),
  terms: [{
    id: 'termsaleRussiaMovie4',
    contractId: 'saleRussiaMovie4',
    duration: {
      from: new Date('06/01/2033'),
      to: new Date('01/01/2035')
    },
    medias: ['freeTv'],
    territories: ['russia'],
    exclusive: false
  }],
} as FullSale;

export const saleGermanyMovie4 = {
  ...createSale({
    titleId: 'Movie4',
    id: 'saleGermanyMovie4',
    termIds: ['termsaleGermanyMovie4'],
  }),
  terms: [{
    id: 'termsaleGermanyMovie4',
    contractId: 'saleGermanyMovie4',
    duration: {
      from: new Date('06/01/2021'),
      to: new Date('01/01/2023')
    },
    medias: ['freeTv'],
    territories: ['germany'],
    exclusive: false
  }],
} as FullSale;

export const mandateMovie5 = {
  ...createMandate({
    titleId: 'Movie5',
    id: 'mandateMovie5',
    termIds: ['termMandateMovie5'],
  }),
  terms: [{
    id: 'termMandateMovie5',
    contractId: 'mandateMovie5',
    duration: {
      from: new Date('01/01/2021'),
      to: new Date('01/31/2040')
    },
    medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'video', 'hotels', 'planes'],
    territories: allButSouthKorea,
    exclusive: true
  }],
} as FullMandate;

export const saleAfghanistanMovie5 = {
  ...createSale({
    titleId: 'Movie5',
    id: 'saleAfghanistanMovie5',
    termIds: ['termsaleAfghanistanMovie5'],
  }),
  terms: [{
    id: 'termsaleAfghanistanMovie5',
    contractId: 'saleAfghanistanMovie5',
    duration: {
      from: new Date('06/01/2023'),
      to: new Date('01/01/2024')
    },
    medias: ['freeTv'],
    territories: ['afghanistan'],
    exclusive: true
  }],
} as FullSale;

export const saleGermanyMovie5 = {
  ...createSale({
    titleId: 'Movie5',
    id: 'saleGermanyMovie5',
    termIds: ['termsaleGermanyMovie5'],
  }),
  terms: [{
    id: 'termsaleGermanyMovie5',
    contractId: 'saleGermanyMovie5',
    duration: {
      from: new Date('06/01/2021'),
      to: new Date('01/01/2023')
    },
    medias: ['freeTv'],
    territories: ['germany'],
    exclusive: true
  }],
} as FullSale;
