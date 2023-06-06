
import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Genre, isInKeys, Language, Movie, Organization, Term, Territory } from '@blockframes/model';
import { Collections } from './../internals/utils';

/**
 * Fix languages, territories, genres on terms, movies & orgs
 * @returns
 */
export async function upgrade(db: Firestore) {
  const terms = await db.collection('terms').get();
  const movies = await db.collection('movies').get();
  const orgs = await db.collection('orgs').get();

  console.log('----------PROCESSING TERMS COLLECTION----------');
  await runChunks(terms.docs, async (doc) => {
    const term = doc.data() as Term;

    term.territories = Array.from(new Set(term.territories.map(t => correctTerritory(t, 'terms', term.id)).filter(t => !!t)));

    for (const lang of Object.keys(term.languages)) {
      const correctedValue = correctLanguage(lang as Language, 'terms', term.id);
      if (correctedValue) {
        term.languages[correctedValue] = term.languages[lang];
        if (correctedValue !== lang) {
          delete term.languages[lang];
        }
      } else {
        delete term.languages[lang];
      }

    }

    await doc.ref.set(term);
  }, undefined, false);

  console.log('----------PROCESSING MOVIES COLLECTION----------');
  await runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    movie.originalLanguages = Array.from(new Set(movie.originalLanguages.map(t => correctLanguage(t, 'movies', movie.id)).filter(t => !!t)));
    movie.originCountries = Array.from(new Set(movie.originCountries.map(t => correctTerritory(t, 'movies', movie.id)).filter(t => !!t)));

    for (const lang of Object.keys(movie.languages)) {
      const correctedValue = correctLanguage(lang as Language, 'movies', movie.id);
      if (correctedValue) {
        movie.languages[correctedValue] = movie.languages[lang];
        if (correctedValue !== lang) {
          delete movie.languages[lang];
        }
      } else {
        delete movie.languages[lang];
      }

    }

    movie.genres = Array.from(new Set(movie.genres.map(t => correctGenre(t, 'movies', movie.id)).filter(t => !!t)));

    await doc.ref.set(movie);
  }, undefined, false);

  console.log('----------PROCESSING ORGS COLLECTION----------');
  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as Organization;

    if (org.addresses?.main?.country && !isInKeys('territories', org.addresses.main.country)) {
      const correctedValue = correctTerritory(org.addresses.main.country, 'orgs', org.id);
      if (correctedValue) {
        org.addresses.main.country = correctedValue;
      } else {
        delete org.addresses.main.country;
      }
    }

    await doc.ref.set(org);
  }, undefined, false);
}

function correctTerritory(givenValue: Territory, collection: Collections, docId: string): Territory {
  if (isInKeys('territories', givenValue)) {
    return givenValue;
  } else {
    switch (givenValue.trim() as any) {
      case 'Macedonia':
        console.log(`Corrected ${collection}/${docId} scope "territories": value ${givenValue} => north-macedonia`);
        return 'north-macedonia';
      case 'Czech Republic':
        console.log(`Corrected ${collection}/${docId} scope "territories": value ${givenValue} => czech`);
        return 'czech';
      default:
        console.log(`Error in ${collection}/${docId} scope "territories": value ${givenValue} not found in static models`);
        return undefined
    }
  }
}

function correctLanguage(givenValue: Language, collection: Collections, docId: string): Language {
  if (isInKeys('languages', givenValue)) {
    return givenValue;
  } else {
    switch (givenValue.trim() as any) {
      case 'mandarin-chinese':
      case 'Mandarin':
      case 'Chinese (Mandarin)':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => mandarin`);
        return 'mandarin';
      case 'Irish':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => irish-gaelic`);
        return 'irish-gaelic';
      case 'Maori':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => maori-nicaragua`);
        return 'maori-nicaragua';
      case 'Portuguese (Brazilian)':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => portuguese`);
        return 'portuguese';
      case 'Latin':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => latin`);
        return 'latin';
      case 'haussa':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => hausa`);
        return 'hausa';
      case 'Spanish':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => spanish`);
        return 'spanish';
      case 'English':
      case 'English subtitles':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => english`);
        return 'english';
      case 'Tagalog':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => tagalog`);
        return 'tagalog';
      case 'laotian':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => lao`);
        return 'lao';
      case 'moldavian':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => romanian`);
        return 'romanian';
      case 'Tibetan':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => tibetan`);
        return 'tibetan';
      case 'Chinese':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => chinese`);
        return 'chinese';
      case 'Yiddish':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => hebrew`);
        return 'hebrew';
      case 'Sango':
        console.log(`Corrected ${collection}/${docId} scope "languages": value ${givenValue} => sangho`);
        return 'sangho';
      default:
        console.log(`Error in ${collection}/${docId} scope "languages": value ${givenValue} not found in static models`);
        return undefined
    }
  }
}

function correctGenre(givenValue: Genre, collection: Collections, docId: string): Genre {
  if (isInKeys('genres', givenValue)) {
    return givenValue;
  } else {
    switch (givenValue.trim() as any) {
      case 'Thriler':
        console.log(`Corrected ${collection}/${docId} scope "genres": value ${givenValue} => thriller`);
        return 'thriller';
      case 'Adventue':
        console.log(`Corrected ${collection}/${docId} scope "genres": value ${givenValue} => adventure`);
        return 'adventure';
      case 'Western':
        console.log(`Corrected ${collection}/${docId} scope "genres": value ${givenValue} => action`);
        return 'action';
      default:
        console.log(`Error in ${collection}/${docId} scope "genres": value ${givenValue} not found in static models`);
        return undefined
    }
  }
}
