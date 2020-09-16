import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie, MovieStakeholders } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'movie-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisticComponent implements OnInit {

  public movie$ = this.movieQuery.selectActive();
  public loading$ = this.movieQuery.selectLoading();

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Artistic Info');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: keyof MovieStakeholders) {
    return movie.stakeholders[role].map(stakeholder => {
      return (stakeholder.countries && !!stakeholder.countries.length)
        ? `${stakeholder.displayName} (${stakeholder.countries.map(country => getLabelBySlug('TERRITORIES', country))})`
        :  stakeholder.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string) {    
    return movie.cast.filter(member => member.role === role).map(member => {
      return !!member.role
      ? `${member.firstName} ${member.lastName} (${member.role})`
      : `${member.firstName} ${member.lastName}`
    })
  }

}
