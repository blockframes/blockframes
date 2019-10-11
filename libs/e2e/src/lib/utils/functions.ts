export const randomString = (): string => `${Math.floor(Math.random() * 10000000)}`;

export const randomEmail = (): string =>
  `cypress${Math.floor(Math.random() * 10000) + 1}@blockframes.com`;

export const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'JPY':
      return '¥';
    case 'GBP':
      return '£';
    case 'AUD':
      return 'A$';
    case 'CAD':
      return 'CA$';
    case 'CHF':
      return 'CHF';
    case 'CNY':
      return 'CN¥';
    case 'SEK':
      return 'SEK';
    case 'NZD':
      return 'NZ$';
  }
};
