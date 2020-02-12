import { hasLanguage } from './filter.util';
import { Movie } from '@blockframes/movie';
import { MovieLanguageSpecification } from '@blockframes/movie/types';

// Aznavour 2020-02-12
const movie: Movie = {
  id: 'cF4YkEJnwgaWQdjgVCO2',
  versionInfo: {
    languages: {
      english: { original: false, subtitle: true, dubbed: false, caption: false },
      german: { subtitle: false, dubbed: false, caption: true, original: false },
      french: { dubbed: true, caption: false, original: true, subtitle: false }
    }
  }
} as Movie;

describe('test hasLanguage', () => {
  // Note: we don't handle searching for a name without at least one field
  const lang = ({ original, dubbed, subtitle, caption }: any): MovieLanguageSpecification => ({
    original: !!original,
    dubbed: !!dubbed,
    subtitle: !!subtitle,
    caption: !!caption
  });

  test('filter on a movie without language returns false', () => {
    const movieWithoutLanguageBis = { versionInfo: { languages: {} } } as Movie;
    expect(hasLanguage(movieWithoutLanguageBis, {} as any)).toBeTruthy();
    expect(
      hasLanguage(movieWithoutLanguageBis, { english: lang({ original: true }) } as any)
    ).toBeFalsy();
  });

  test('filter for a language we do not have returns false (japanese for aznavour)', () => {
    expect(hasLanguage(movie, { japanese: lang({ original: true }) } as any)).toBeFalsy();
    expect(
      hasLanguage(movie, {
        japanese: lang({ original: true }),
        english: lang({ subtitle: true })
      } as any)
    ).toBeTruthy();
  });

  test('filter on a language with only one value (english for aznavour)', () => {
    expect(hasLanguage(movie, { english: lang({ subtitle: true }) } as any)).toBeTruthy();
    expect(hasLanguage(movie, { english: lang({ original: true }) } as any)).toBeFalsy();
    expect(
      hasLanguage(movie, { english: lang({ subtitle: true, original: true }) } as any)
    ).toBeTruthy();
  });
});
