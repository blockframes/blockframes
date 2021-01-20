import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { genres as staticGenres, languages, territoriesISOA2 } from '@blockframes/utils/static-model/static-model';
import { formatRunningTime } from "@blockframes/movie/pipes/running-time.pipe";

@Pipe({
  name: 'movieFeature',
  pure: true
})
export class MovieFeaturePipe implements PipeTransform {
  transform(value: Movie): string {
    const { contentType, runningTime, genres, originalLanguages, release, stakeholders } = value;

    let displayedGenres = '';
    if (genres.length > 0) displayedGenres += staticGenres[genres[0]];
    if (genres.length > 1) displayedGenres += ', ...';

    let displayedLanguages = '';
    if (originalLanguages.length > 0) displayedLanguages += languages[originalLanguages[0]];
    if (originalLanguages.length > 1) displayedLanguages += ', ...';

    let displayedProductionCountries = '';
    if (!!stakeholders) {
      const productionCountries = [];
      for (const company of stakeholders.productionCompany) {
        for (const country of company.countries) {
          if (!productionCountries.includes(country)) productionCountries.push(country);
        }
      }
      productionCountries.forEach((country, index) => {
        if (index === 0) displayedProductionCountries += territoriesISOA2[country];
        if (index === 1) displayedProductionCountries += `, ${territoriesISOA2[country]}`;
        if (index === 2) displayedProductionCountries += `, ...`;
      })
    }

    return [
      contentType ? contentType[contentType] : '',
      displayedGenres,
      displayedProductionCountries,
      displayedLanguages,
      release.year,
      formatRunningTime(runningTime, false)
    ].filter(v => !!v).join(' | ');
  }
}

@NgModule({
  declarations: [MovieFeaturePipe],
  exports: [MovieFeaturePipe]
})
export class MovieFeatureModule { }
