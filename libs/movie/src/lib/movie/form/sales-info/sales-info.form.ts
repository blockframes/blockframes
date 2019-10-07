import { MovieSalesInfo, createMovieSalesInfo, Movie } from '../../+state';
import { FormEntity, FormField, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createInternationalPremiereControl(entity : Partial<MovieSalesInfo> = {}) {
  return {
    name: new FormField(entity.internationalPremiere.name),
    year: new FormField(entity.internationalPremiere.year)
  }
}

type InternationalPremiereControl = ReturnType<typeof createInternationalPremiereControl>;

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormField(entity.scoring),
    color: new FormField(entity.color),
    europeanQualification: new FormField<Boolean>(entity.europeanQualification),
    pegi: new FormField(entity.pegi),
    certifications: new FormField(entity.certifications),
    internationalPremiere: new FormEntity<InternationalPremiereControl>({
      name: new FormField(entity.internationalPremiere.name),
      year: new FormField(entity.internationalPremiere.year),
    }),
    originCountryReleaseDate: new FormField<Date>(entity.originCountryReleaseDate),
    broadcasterCoproducers: FormList.factory(entity.broadcasterCoproducers),
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

}
