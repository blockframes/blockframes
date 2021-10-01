import {
  createBoxOffice,
  createMovieOriginalRelease,
  createMovieRating,
  createMovieReview,
  createPrize,
  createAudienceGoals,
  Movie,
  populateMovieLanguageSpecification
} from "@blockframes/movie/+state/movie.model";
import { MovieImportState } from "libs/import/src/lib/utils";
import { createCredit, createStakeholder } from "../common-interfaces/identity";
import { getKeyIfExists } from "../helpers";
import { Scope } from "../static-model/static-model";

const datesRegex = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-](\d{4})$/;

export function formatOriginalRelease(originalRelease: { date: string, country: string, media: string }[], state: MovieImportState) {
  return originalRelease.filter(r => r.date).map(r => {
    const dateParts = r.date.match(datesRegex);
    let date: Date;
    if (dateParts && dateParts.length === 4) {
      date = new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`);
    } else if (r.date.length === 5) {
      // https://gist.github.com/christopherscott/2782634
      date = new Date((parseInt(r.date, 10) - (25567 + 1)) * 86400 * 1000);
    }

    if (date) {
      const originalRelease = createMovieOriginalRelease({ date });
      const country = getKeyIfExists('territories', r.country);
      if (country) {
        originalRelease.country = country;
      }

      const media = getKeyIfExists('medias', r.media);
      if (media) {
        originalRelease.media = media;
      }

      return originalRelease;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.originalRelease',
        name: 'Original releases',
        reason: `Invalid date ${r.date}`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(r => r);
}

export function formatStakeholders(stakeholders: { displayName: string, country: string, role: string }[], movie: Movie, state: MovieImportState) {
  stakeholders.filter(s => s.displayName).forEach(s => {
    const stakeHolder = createStakeholder({ displayName: s.displayName });

    const country = getKeyIfExists('territories', s.country);
    if (country) {
      stakeHolder.countries.push(country);
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.stakeholders',
        name: 'Stakeholders',
        reason: `${s.country} not found in territories list`,
        hint: 'Edit corresponding sheet field.'
      });
    }

    const role = getKeyIfExists('stakeholderRoles', s.role);
    if (role) {
      switch (role) {
        case 'broadcasterCoproducer':
          movie.stakeholders.broadcasterCoproducer.push(stakeHolder);
          break;
        case 'financier':
          movie.stakeholders.financier.push(stakeHolder);
          break;
        case 'laboratory':
          movie.stakeholders.laboratory.push(stakeHolder);
          break;
        case 'salesAgent':
          movie.stakeholders.salesAgent.push(stakeHolder);
          break;
        case 'distributor':
          movie.stakeholders.distributor.push(stakeHolder);
          break;
        case 'lineProducer':
          movie.stakeholders.lineProducer.push(stakeHolder);
          break;
        case 'coProducer':
          movie.stakeholders.coProductionCompany.push(stakeHolder);
          break;
        case 'executiveProducer':
        default:
          movie.stakeholders.productionCompany.push(stakeHolder);
          break;
      }
    } else {
      state.errors.push({
        type: 'error',
        field: 'movie.stakeholders',
        name: 'Stakeholders',
        reason: `${s.role} not found in Stakeholders roles list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  })
}

export function formatProductionStatus(productionStatus: string, movie: Movie, state: MovieImportState) {
  if (productionStatus) {

    const movieStatus = getKeyIfExists('productionStatus', productionStatus);
    if (movieStatus) {
      movie.productionStatus = movieStatus;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.productionStatus',
        name: 'Production status',
        reason: `Production status ${productionStatus} could not be parsed`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  } else {
    movie.productionStatus = "finished";
    state.errors.push({
      type: 'warning',
      field: 'movie.productionStatus',
      name: 'Production status',
      reason: 'Production status not found, assumed "Completed"',
      hint: 'Edit corresponding sheet field.'
    });
  }
}

export function formatPrizes(prizes: { name: string, premiere: string, prize: string, year: number }[], movie: Movie) {
  movie.prizes = prizes.filter(f => f.name && getKeyIfExists('festival', f.name)).map(f => {
    const premiere = getKeyIfExists('premiereType', f.premiere);
    const prize = createPrize({
      prize: f.prize,
      name: getKeyIfExists('festival', f.name),
      year: f.year,
    });

    if (premiere) {
      prize.premiere = premiere;
    }

    return prize;
  });

  movie.customPrizes = prizes.filter(f => f.name && !getKeyIfExists('festival', f.name)).map(f => {
    const premiere = getKeyIfExists('premiereType', f.premiere);
    const prize = createPrize({
      prize: f.prize,
      name: f.name,
      year: f.year,
    });

    if (premiere) {
      prize.premiere = premiere;
    }

    return prize;
  });
}

export function formatRunningTime(time: string, status: string, movie: Movie) {
  if (!isNaN(Number(time))) {
    movie.runningTime.time = parseInt(time, 10);
  }

  const runningTimeStatus = getKeyIfExists('screeningStatus', status);
  if (runningTimeStatus) {
    movie.runningTime.status = runningTimeStatus;
  }
}

export function formatContentType(contentType: string, movie: Movie, state: MovieImportState) {
  if (contentType) {
    const key = getKeyIfExists('contentType', contentType);
    if (key) {
      movie.contentType = key;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.contentType',
        name: 'Work Type',
        reason: `Could not parse work type : ${contentType}`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }
}

export function formatOriginCountries(originCountries: string[], state: MovieImportState) {
  return originCountries.map(c => {
    const country = getKeyIfExists('territories', c);
    if (country) {
      return country;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.originCountries',
        name: 'Countries of origin',
        reason: `${c} not found in territories list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(c => c);
}

export function formatOriginalLanguages(originalLanguages: string[], state: MovieImportState) {
  return originalLanguages.map(l => {
    const language = getKeyIfExists('languages', l);
    if (language) {
      return language;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.originalLanguages',
        name: 'Languages',
        reason: `${l} not found in languages list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(l => l);
}

export function formatGenres(genres: string[], customGenres: string[], movie: Movie, state: MovieImportState) {
  movie.genres = genres.map(g => {
    const genre = getKeyIfExists('genres', g);
    if (genre) {
      return genre;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.genres',
        name: 'Genres',
        reason: `${g} not found in genres list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(g => g);

  movie.customGenres = customGenres;
}

export function formatCredits(credits: { lastName: string, firstName: string, role?: string, description?: string, status?: string }[], scope?: Scope) {
  return credits.filter(c => c.firstName).map(c => {
    const credit = createCredit({ firstName: c.firstName, lastName: c.lastName });

    if (scope && c.role) {
      const role = getKeyIfExists(scope, c.role);
      if (role) {
        credit.role = role;
      }
    }

    if (scope && c.status) {
      const status = getKeyIfExists(scope, c.status);
      if (status) {
        credit.status = status;
      }
    }

    if (c.description) {
      credit.description = c.description;
    }
    return credit;
  });
}

export function formatReleaseYear(year: string, status: string, movie: Movie) {
  if (!isNaN(Number(year))) {
    movie.release.year = parseInt(year, 10);
  }

  const screeningStatus = getKeyIfExists('screeningStatus', status);
  if (screeningStatus) {
    movie.release.status = screeningStatus;
  }
}

export function formatBoxOffice(boxoffice: { territory: string, unit: string, value: string }[], state: MovieImportState) {
  return boxoffice.filter(b => b.territory).map(b => {
    const territory = getKeyIfExists('territories', b.territory);
    const unit = getKeyIfExists('unitBox', b.unit);
    if (territory) {
      if (unit) {
        const boxoffice = createBoxOffice(
          {
            unit,
            value: b.value ? parseInt(b.value, 10) : 0,
            territory
          }
        );
        return boxoffice;
      } else {
        state.errors.push({
          type: 'warning',
          field: 'movie.boxOffice',
          name: 'Box office',
          reason: `Could not parse box office unit : ${b.unit}`,
          hint: 'Edit corresponding sheet field.'
        });
      }
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.boxOffice',
        name: 'Box office',
        reason: `Could not parse box office territory : ${b.territory}`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(b => b);

}

export function formatCertifications(certifications: string[], state: MovieImportState) {
  return certifications.filter(c => c).map(c => {
    const certification = getKeyIfExists('certifications', c);
    if (certification) {
      return certification;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'certifications',
        name: 'Certifications',
        reason: `${c} not found in certifications list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(b => b);
}

export function formatRatings(ratings: { country: string, value: string }[], state: MovieImportState) {
  return ratings.filter(r => r.value && r.country).map(r => {
    const country = getKeyIfExists('territories', r.country);
    const movieRating = createMovieRating({ value: r.value });
    if (country) {
      movieRating.country = country;
      return movieRating;
    } else {
      state.errors.push({
        type: 'warning',
        field: 'rating',
        name: 'Movie rating',
        reason: `Could not parse rating territory : ${r.country}`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  }).filter(b => b);

}

export function formatAudienceGoals(audience: { goals: string, targets: string }[]) {
  const goals = audience.filter(a => a.goals).map(a => getKeyIfExists('socialGoals', a.goals)).filter(g => !!g);
  const targets = audience.filter(a => a.targets).map(a => a.targets);
  return createAudienceGoals({ targets, goals });
}

export function formatReview(reviews: { filmCriticName: string, revue: string, link: string, quote: string }[]) {
  return reviews.filter(r => !!r.revue).map(r => {
    return createMovieReview({
      criticName: r.filmCriticName,
      journalName: r.revue,
      revueLink: r.link,
      criticQuote: r.quote
    })
  }).filter(r => r);
}

export function formatSingleValue(value: string, scope: Scope, path: string, movie: Movie) {
  if (value) {
    const key = getKeyIfExists(scope, value);
    if (key) {
      const pathParts = path.split('.');

      let subObject: unknown = movie[pathParts[0]];

      // access sub-sub-object,
      // we need to stop @length - 2 to keep the reference to the original movie object
      // stopping on the leaf (movie's property) would create a primitive copy
      // and would leave the movie unchanged
      for (let i = 1 ; i < pathParts.length - 1 ; i++) {
        subObject = subObject[pathParts[i]];
      }

      subObject[pathParts[pathParts.length - 1]] = key;
    }
  }
}

export function formatAvailableLanguages(versions: { language: string, dubbed: string, subtitle: string, caption: string }[], movie: Movie, state: MovieImportState) {
  versions.filter(v => v.language).forEach(v => {
    const language = getKeyIfExists('languages', v.language);
    if (language) {
      populateMovieLanguageSpecification(movie.languages, language, 'dubbed', v.dubbed.toLowerCase() === 'yes' ? true : false);
      populateMovieLanguageSpecification(movie.languages, language, 'subtitle', v.subtitle.toLowerCase() === 'yes' ? true : false);
      populateMovieLanguageSpecification(movie.languages, language, 'caption', v.caption.toLowerCase() === 'yes' ? true : false);
    } else {
      state.errors.push({
        type: 'warning',
        field: 'movie.languages',
        name: 'Available version(s)',
        reason: `${v.language} not found in languages list`,
        hint: 'Edit corresponding sheet field.'
      });
    }
  });
}

export function formatNumber(number:string){
  return parseInt(number,10)
}
