import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Movie, MovieQuery, MovieService } from '../+state';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { MatDialog } from '@angular/material/dialog';
import { TitleFormComponent } from '../title-form/title-form.component';

@Component({
  selector: 'movie-financing-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  movies$: Observable<Movie[]>;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private router: Router,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog
  ) {
  }

  // Initiate the Movies in Akita
  ngOnInit() {
    this.orgQuery.selectActive().subscribe((org: Organization) => {
      // @todo remove observable on ngDestroy
      this.service.subscribeOrgMovies(org.id);
    });

    this.movies$ = this.query.selectAll();
  }

  public addNewMovie() {
    this.dialog.open(TitleFormComponent);
  }

  public delete(id: string) {
    this.service.remove(id);
  }

}
