import { MovieSalesInfo, createMovieSalesInfo, Movie } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';

function createMovieSalesInfoControls(salesInfo: Partial<MovieSalesInfo> = {}){
  const entity = createMovieSalesInfo(salesInfo);
  return {
    scoring: new FormField(entity.scoring),
    color: new FormField(entity.color),
    europeanQualification: new FormField<Boolean>(entity.europeanQualification),
    pegi: new FormField(entity.pegi),
    certifications: new FormField(entity.certifications),
    internationalPremiere: new FormEntity<Movie['salesInfo']['internationalPremiere']>({
      name: new FormField(entity.internationalPremiere.name),
      year: new FormField(entity.internationalPremiere.year),
    }),
    originCountryReleaseDate: new FormField<Date>(entity.originCountryReleaseDate),
  }
}

type MovieSalesInfoControl = ReturnType<typeof createMovieSalesInfoControls>

export class MovieSalesInfoForm extends FormEntity<Partial<MovieSalesInfo>, MovieSalesInfoControl>{
  constructor(SalesInfo : MovieSalesInfo) {
    super(createMovieSalesInfoControls(SalesInfo));
  }

}