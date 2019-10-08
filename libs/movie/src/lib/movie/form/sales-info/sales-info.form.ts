import { MovieSalesInfo, createMovieSalesInfo } from '../../+state';
import { FormEntity, FormField, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createInternationalPremiereControl(entity : Partial<MovieSalesInfo['internationalPremiere']> = {}) {
  return {
    name: new FormField(entity.name),
    year: new FormField(entity.year)
  }
}

type InternationalPremiereControl = ReturnType<typeof createInternationalPremiereControl>;

class InternationalPremiereForm extends FormEntity<InternationalPremiereControl> {
  constructor(entity : Partial<MovieSalesInfo['internationalPremiere']>) {
    super(createInternationalPremiereControl(entity));
  }
}

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormField(entity.scoring),
    color: new FormField(entity.color),
    europeanQualification: new FormField<Boolean>(entity.europeanQualification),
    pegi: new FormField(entity.pegi),
    certifications: new FormField(entity.certifications),
    internationalPremiere: new InternationalPremiereForm(entity.internationalPremiere),
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
