import { Avails, Currency } from '@blockframes/e2e/utils/type';

export const avails: Avails = {
  territories: ['world'],
  from: {
    year: 2025,
    month: 'JAN',
    day: 1
  },
  to: {
    year: 2026,
    month: 'DEC',
    day: 31
  },
  medias: ['A-VOD'],
  exclusive: true
};

export const defaultCurrency: Currency = { label: 'Euro', value: 'EUR'};
