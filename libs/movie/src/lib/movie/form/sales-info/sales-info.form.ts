import { MovieSalesInfo, createMovieSalesInfo, createPrize, createMovieRating } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MovieRating } from '@blockframes/movie/movie+state/movie.firestore';

function createInternationalPremiereControl(entity?: Partial<MovieSalesInfo['internationalPremiere']>) {;
  const { name, year } = createPrize(entity)
  return {
    name: new FormControl(name),
    year: new FormControl(year)
  }
}

type InternationalPremiereControl = ReturnType<typeof createInternationalPremiereControl>;

class InternationalPremiereForm extends FormEntity<InternationalPremiereControl> {
  constructor(entity?: Partial<MovieSalesInfo['internationalPremiere']>) {
    super(createInternationalPremiereControl(entity));
  }
}

function createRatingFormControl(entity?: Partial<MovieRating>) {
  const { country, reason, system, value } = createMovieRating(entity);
  return { 
    country: new FormControl(country),
    reason: new FormControl(reason),
    system: new FormControl(system),
    value: new FormControl(value),
  }
}

type RatingFormControl = ReturnType<typeof createRatingFormControl>;

export class MovieRatingForm extends FormEntity<RatingFormControl> {
  constructor(rating?: MovieRating) {
    super(createRatingFormControl(rating));
  }
}

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormControl(entity.scoring),
    color: new FormControl(entity.color),
    europeanQualification: new FormControl(entity.europeanQualification),
    rating: FormList.factory(entity.rating, el => new MovieRatingForm(el)),
    certifications: new FormControl(entity.certifications),
    internationalPremiere: new InternationalPremiereForm(entity.internationalPremiere),
    broadcasterCoproducers: FormList.factory(entity.broadcasterCoproducers),
    format: new FormControl(entity.format),
    formatQuality: new FormControl(entity.formatQuality),
    soundFormat: new FormControl(entity.soundFormat)
  }
}

type MovieSalesInfoControl = ReturnType<typeof createMovieSalesInfoControls>

export class MovieSalesInfoForm extends FormEntity<MovieSalesInfoControl>{
  constructor(SalesInfo : MovieSalesInfo) {
    super(createMovieSalesInfoControls(SalesInfo));
  }

  get broadcasterCoproducers() {
    return this.get('broadcasterCoproducers');
  }

  public addBroadcasterCoproducers(): void {
    this.broadcasterCoproducers.push(new FormControl(''));
  }

  public removeBroadcasterCoproducers(i: number): void {
   this.broadcasterCoproducers.removeAt(i);
  }

  get rating() {
    return this.get('rating');
  }

  public getRating(i: number) {
    return this.rating.controls[i];
  }

  public addRating(): void {
    const rating = new MovieRatingForm();
    this.rating.push(rating);
  }

  public removeRating(i: number): void {
    this.rating.removeAt(i);
  }

}
