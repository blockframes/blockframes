import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;

  navLinks = [
    {
      path: 'activity',
      label: 'Marketplace Activity'
    },
    {
      path: 'details',
      label: 'Film Details'
    }
  ];

  constructor(private movieQuery: MovieQuery, private title: Title) {
    this.refreshTitle()
  }

  ngOnInit() {
    this.getMovie();
  }

  /**
* We need to dinstinguish between page load and route change
* from mat tab component.
* @param link optional param when the function is getting called from the template 
*/
  public refreshTitle(link?: string) {
    if (link) {
      switch (link) {
        case 'activity': this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Marketplace Activity`);
          break;
        case 'details': this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Film Details`);
          break;
      }
    } else {
      Object.keys(this.movieQuery.getValue().entities).length
        ? this.title.setTitle('All offers and deals - Archipel Content')
        : this.title.setTitle('Offers and Deals - Archipel Content')
    }
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPoster(movie: Movie) {
    return movie.promotionalElements.poster.length && movie.promotionalElements.poster[0].media;
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }
}
