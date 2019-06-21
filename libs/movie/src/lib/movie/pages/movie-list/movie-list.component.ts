import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MovieService } from '../../+state';
import { Observable } from 'rxjs';
import { OrganizationQuery, OrganizationWithMovies } from '@blockframes/organization';
import { MatDialog } from '@angular/material/dialog';
import { MovieTitleFormComponent } from '../../components/movie-title-form/movie-title-form.component';

@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieListComponent implements OnInit {
  public orgs$: Observable<OrganizationWithMovies[]>;

  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.orgs$ = this.orgQuery.orgsWithMovies$;
  }

  public addNewMovie(event: MouseEvent, org: { id: string, name: string}) {
    event.stopPropagation();
    this.dialog.open(MovieTitleFormComponent, { data: org });
  }

  public delete(id: string) {
    this.service.remove(id);
  }
}
