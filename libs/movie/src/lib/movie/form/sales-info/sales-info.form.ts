import { MovieSalesInfo, createMovieSalesInfo, createPrize } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormControl(entity.scoring),
    color: new FormControl(entity.color),
    europeanQualification: new FormControl(entity.europeanQualification),
    pegi: new FormControl(entity.pegi),
    certifications: new FormControl(entity.certifications),
    originCountryReleaseDate: new FormControl(entity.originCountryReleaseDate),
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

}
