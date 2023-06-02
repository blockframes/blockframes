
import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { isInKeys, Language, Movie, Organization, Term, Territory } from '@blockframes/model';
import { Collections } from './../internals/utils';

/**
 * Fix languages & territories on terms, movies & orgs
 * @returns
 */
export async function upgrade(db: Firestore) {
  const terms = await db.collection('terms').get();
  const movies = await db.collection('movies').get();
  const orgs = await db.collection('orgs').get();

  console.log('----------PROCESSING TERMS COLLECTION----------');
  await runChunks(terms.docs, async (doc) => {
    const term = doc.data() as Term;

    term.territories = term.territories.map(t => correctTerritory(t, 'terms', term.id)).filter(t => !!t);

    for (const lang of Object.keys(term.languages)) {
      const correctedValue = correctLanguage(lang as Language, 'terms', term.id);
      if (correctedValue) {
        term.languages[correctedValue] = term.languages[lang];
      }
      delete term.languages[lang];
    }

    await doc.ref.set(term);
  }, undefined, false);

  console.log('----------PROCESSING MOVIES COLLECTION----------');
  await runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    movie.originalLanguages = movie.originalLanguages.map(t => correctLanguage(t, 'movies', movie.id)).filter(t => !!t);
    movie.originCountries = movie.originCountries.map(t => correctTerritory(t, 'movies', movie.id)).filter(t => !!t);

    for (const lang of Object.keys(movie.languages)) {
      const correctedValue = correctLanguage(lang as Language, 'movies', movie.id);
      if (correctedValue) {
        movie.languages[correctedValue] = movie.languages[lang];
      }
      delete movie.languages[lang];
    }

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
      default:
        console.log(`Error in ${collection}/${docId} scope "languages": value ${givenValue} not found in static models`);
        return undefined
    }
  }
}
