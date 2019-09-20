import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { CatalogSearch } from './search.form';
import { Movie } from '@blockframes/movie/movie/+state';

function productionYearBetween(movie: Movie, range: { from: number; to: number }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  // prevent from default error that property is undefined
  if (typeof range.from && typeof range.to) {
    return movie.main.productionYear >= range.from && movie.main.productionYear <= range.to;
  }
}
function hasLanguage(
  movie: Movie,
  language: { name: string; original: boolean; dubbed: boolean; subtitle: boolean }
): boolean {
  if (!language) {
    return true;
  }
  let original = true;
  let dubbed = true;
  let subtitle = true;
  if (language.original) {
    original = movie.main.languages.includes(language.name.toLowerCase());
  }
  if (language.dubbed) {
    dubbed = movie.versionInfo.dubbings.includes(language.name.toLowerCase());
  }
  if (language.subtitle) {
    subtitle = movie.versionInfo.subtitles.includes(language.name.toLowerCase());
  }
  return original && dubbed && subtitle;
}

function types(movie: Movie, movieGenre: string[]): boolean {
  if (!movieGenre.length) {
    return true;
  }
  // we have to make it lowercase to make sure we are comapring correctly
  const movieGenreToLowerCase = movieGenre.map(type => type.toLowerCase());
  const movieTypesToLowerCase = movie.main.genres.map(genre => genre.toLowerCase());
  for (let i = 0; i < movieTypesToLowerCase.length; i++) {
    for (let k = 0; k < movieGenreToLowerCase.length; k++) {
      if (movieTypesToLowerCase[i] === movieGenreToLowerCase[k]) {
        return true;
      }
    }
  }
}
function certifications(movie: Movie, movieCertification: string[]): boolean {
  if (!movieCertification.length) {
    return true;
  }
  // we have to make it lowercase to make sure we are comapring correctly
  const movieFilterCertificationToLowerCase = movieCertification.map(certification =>
    certification.toLowerCase()
  );
  const movieCertificationToLowerCase = movie.salesInfo.certifications.map(cert =>
    cert.toLowerCase()
  );
  for (let i = 0; i <= movieFilterCertificationToLowerCase.length; i++) {
    for (let k = 0; k <= movieCertificationToLowerCase.length; k++) {
      if (movieCertificationToLowerCase[i] === movieFilterCertificationToLowerCase[k]) {
        return true;
      }
    }
  }
}

function availabilities(movie: Movie, range: { from: Date; to: Date }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  return (
    movie.sales.some(sale => {
      if (sale.rights) {
        const from: Date = (sale.rights.from as any).toDate();
        return from.getTime() <= range.from.getTime();
      }
    }) &&
    movie.sales.some(sale => {
      if (sale.rights) {
        const to: Date = (sale.rights.to as any).toDate();
        return to.getTime() >= range.to.getTime();
      }
    })
  );
}

function territories(movie: Movie, territory: string): boolean {
  if (!territory) {
    return true;
  }
  return movie.salesAgentDeal.territories.includes(territory.toLowerCase());
}
function media(movie: Movie, movieMediaType: string): boolean {
  if (!movieMediaType) {
    return true;
  }
  return movie.salesAgentDeal.medias.includes(movieMediaType.toLowerCase());
}

export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  const hasEveryLanguage = Object.keys(filter.languages)
    .map(name => ({
      ...filter.languages[name],
      name
    }))
    .every(language => hasLanguage(movie, language));
  const hasMedia = filter.medias.every(movieMedia => media(movie, movieMedia));
  const hasTerritory = filter.territories.every(territory => territories(movie, territory));
  return (
    productionYearBetween(movie, filter.productionYear) &&
    hasEveryLanguage &&
    types(movie, filter.type) &&
    certifications(movie, filter.certifications) &&
    availabilities(movie, filter.availabilities) &&
    hasTerritory &&
    hasMedia
  );
}
