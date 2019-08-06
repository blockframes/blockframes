import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FireQuery } from '@blockframes/utils';

interface MovieSections {
  sectionName: string;
  subline: string;
  link: string;
}

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogHomeComponent implements OnInit {
  /** Observable to fetch all movies from the store */
  public movies$: Observable<any>;

  public keys: MovieSections[] = [
    {
      sectionName: 'New Films',
      subline: 'Lorem Ipsum',
      link: '#',
    },
    {
      sectionName: 'Best Sellers',
      subline: 'Lorem Ipsum',
      link: '#',
    },
    {
      sectionName: 'Awarded Films',
      subline: 'Lorem Ipsum',
      link: '#',
    }
  ];

  constructor(private fireQuery: FireQuery) {}

  ngOnInit() {
    // TODO #721: look for query when data query model is done.
    this.movies$ = this.fireQuery.fromQuery<Movie>('movies');
  }
}
