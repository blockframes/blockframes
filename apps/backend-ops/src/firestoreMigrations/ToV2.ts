import {
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Transaction,
  DocumentReference
} from '../admin';
import { union, pickBy, identity } from 'lodash';
import { PLACEHOLDER_LOGO } from '@blockframes/organization';

const withoutUndefined = x => pickBy(x, identity);

/**
 * Lets you select values from an item while configuring default values.
 *
 * Select all the keys from defaultValues in item,
 * if a value is undefined, uses the default Value.
 *
 * selectAndMergeValues({a: undefined, b: 2, c: true}, {a: 42, c: false}) => {a: 42, c: true}
 */
const selectAndMergeValues = (item, defaultValues) => {
  const result = { ...defaultValues };

  Object.keys(defaultValues).forEach(key => {
    if (item[key] !== undefined) {
      result[key] = item[key];
    }
  });

  return result;
};

/**
 * Build a new field 'Budget' (map) in movie document ?
 */
function buildBudgetIntoMovieDoc(movies: QuerySnapshot) {
  const budget = {};
  movies.forEach(doc => {
    const { movieId } = doc.data();
    const id = doc.id;
    const currents = budget[movieId]; // Pas compris ce budget[movieId]

    if (currents === undefined) {
      budget[movieId] = {
        totalBudget: '',
        budgetCurrency: '',
        detailedBudget: ''
      };
    } else {
      budget[movieId] = { currents };
    }
  });
}


/**
 * Migration for invitation document
 * from organizationId to organization object
 */





  // const orgInfo = organizationDoc.data();
  // invitations.forEach(doc => {
  //   const organizationIdToChange = doc.data().organizationId;
  //   if (organizationIdToChange === orgInfo.id) {
  //     // utiliser firestore
  //     doc.data().organizationId = {
  //       id: orgInfo.id,
  //       name: orgInfo.name
  //     }
  //   }
  // })

/**
 * Function to upgrade movie data
 */
function upgradeMovie(movie: QueryDocumentSnapshot, tx: Transaction) {
  const data = movie.data();
  const defaultValues = {
    _type: 'movies',
    budget: {
      totalBudget: '' || data.budget.totalBudget,
      budgetCurrency: '' || data.budget.budgetCurrency,
      detailedBudget: '' || data.budget.detailedBudget
    },
    deliveryIds: [] || data.deliveryIds,
    festivalPrizes: {
      prizes: [{
        name: '' || data.festivalPrizes.prizes.name,
        year: '' || data.festivalPrizes.prizes.year,
        prize: '' || data.festivalPrizes.prizes.prize,
        logo: '' || data.festivalPrizes.prizes.logo
      }]
    },
    main: {
      directors: [{
        firstName: '' || data.main.directors.firstName,
        lastName: '' || data.main.directors.lastName
      }],
      genres: [] || data.main.genres,
      internalRef: '' || data.main.internalRef,
      isan: '' || data.main.isan,
      languages: [] || data.main.languages,
      length: '' || data.main.length,
      originCountries: [] || data.main.originCountries,
      poster: '' || data.main.poster,
      productionCompagnies: [{
        firstName: '' || data.main.productionCompagnies.firstName
      }],
      productionYear: '' || data.main.productionYear,
      status: '' || data.main.status,
      shortSynopsis: '' || data.main.shortSynopsis,
      title: {
        international: '' || data.main.title.international,
        original: '' || data.main.title.original
      }
    },
    promotionalDescription: {
      keyAssets: [] || data.promotionalDescription.keyAssets,
      keywords: [] || data.promotionalDescription.keywords
    },
    promotionalElements: {
      images: [],
      promotionalElements: [{
        label: '' || data.promotionalElements.label,
        ratio: '' || data.promotionalElements.ratio,
        type: '' || data.promotionalElements.type,
        url: '' || data.promotionalElements.url
      }]
    },
    salesAgentDeal: {
      medias: [],
      reservedTerritories: [],
      rights: {
        from: '' || data.salesAgentDeal.rights.from,
        to: '' || data.salesAgentDeal.rights.to
      },
      salesAgent: {
        creditRole: '' || data.salesAgentDeal.salesAgent.creditRole,
        displayName: '' || data.salesAgentDeal.salesAgent.displayName,
        firstName: '' || data.salesAgentDeal.salesAgent.firstName,
        lastName: '' || data.salesAgentDeal.salesAgent.lastName,
        logo: '' || data.salesAgentDeal.salesAgent.logo
      },
      territories: [] || data.salesAgentDeal.territories
    },
    salesCast: {
      credits: [{
        creditRole: '' || data.salesCast.credits.creditRole,
        firstName: '' || data.salesCast.credits.firstName,
        lastName: '' || data.salesCast.credits.lastName
      }]
    },
    salesInfo: {
      broadcasterCoproducers: [],
      certifications: [],
      color: '' || data.salesInfo.color,
      europeanQualification: '' || data.salesInfo.europeanQualification,
      internationalPremiere: {
        name: '' || data.salesInfo.internationalPremiere.name,
        prize: '' || data.salesInfo.internationalPremiere.prize,
        year: '' || data.salesInfo.internationalPremiere.year
      },
      originCountryReleaseDate: '' || data.salesInfo.originCountryReleaseDate,
      pegi: '' || data.salesInfo.pegi,
      scoring: '' || data.salesInfo.scoring,
      theatricalRelease: '' || data.salesInfo.theatricalRelease
    },
    story: {
      logline: '' || data.story.logline,
      synopsis: '' || data.story.synopsis
    },
    versionInfo: {
      dubbings: [] || data.versionInfo.dubbings,
      subtitles: [] || data.versionInfo.subtitles
    }
  }

  const newMovieData = selectAndMergeValues(data, defaultValues);
  tx.update(movie.ref, newMovieData);
}
