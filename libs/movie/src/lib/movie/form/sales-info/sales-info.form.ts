import { MovieSalesInfo, createMovieSalesInfo, createMovieRating, createMovieOriginalRelease } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MovieRating, MovieOriginalRelease } from '@blockframes/movie/movie+state/movie.firestore';

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
  constructor(rating?: Partial<MovieRating>) {
    super(createRatingFormControl(rating));
  }
}

function createOriginalReleaseFormControl(entity?: Partial<MovieOriginalRelease>) {
  const { country, date, media } = createMovieOriginalRelease(entity);
  return { 
    country: new FormControl(country),
    date: new FormControl(date),
    media: new FormControl(media),
  }
}

type OriginalReleaseFormControl = ReturnType<typeof createOriginalReleaseFormControl>;

export class OriginalReleaseForm extends FormEntity<OriginalReleaseFormControl> {
  constructor(originalRelease?: Partial<MovieOriginalRelease>) {
    super(createOriginalReleaseFormControl(originalRelease));
  }
}

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormControl(entity.scoring),
    color: new FormControl(entity.color),
    rating: FormList.factory(entity.rating, el => new MovieRatingForm(el)),
    certifications: new FormControl(entity.certifications),
    originalRelease: FormList.factory(entity.originalRelease, el => new OriginalReleaseForm(el)),
    broadcasterCoproducers: FormList.factory(entity.broadcasterCoproducers),
    format: new FormControl(entity.format),
    formatQuality: new FormControl(entity.formatQuality),
    soundFormat: new FormControl(entity.soundFormat),
    // theatricalRelease: new FormControl(entity.theatricalRelease),
  }
}

export type MovieSalesInfoControl = ReturnType<typeof createMovieSalesInfoControls>

export class MovieSalesInfoForm extends FormEntity<MovieSalesInfoControl>{
  constructor(SalesInfo?: Partial<MovieSalesInfo>) {
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

  get originalRelease() {
    return this.get('originalRelease');
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

  public getOriginalRelease(i: number) {
    return this.originalRelease.controls[i];
  }

  public addOriginalRelease(): void {
    const orignialRelease = new OriginalReleaseForm();
    this.originalRelease.push(orignialRelease);
  }

  public removeOriginalRelease(i: number): void {
    this.originalRelease.removeAt(i);
  }

}
