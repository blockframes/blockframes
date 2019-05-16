import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MovieService } from '../+state';
import { Observable } from 'rxjs';
import { OrganizationQuery, OrganizationWithMovies, Organization } from '@blockframes/organization';
import { MatDialog } from '@angular/material/dialog';
import { TitleFormComponent } from '../title-form/title-form.component';
import { takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'movie-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  public orgs$: Observable<OrganizationWithMovies[]>;
  public hasOrgs$: Observable<boolean>;
  isAlive= true;

  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog,
  ) {}

  // Initiate the Movies in Akita
  ngOnInit() {
    this.service.moviesOfOrganizations$.pipe(takeWhile(() => this.isAlive)).subscribe();
    this.orgs$ = this.orgQuery.orgsWithMovies$;
    this.hasOrgs$ = this.orgQuery.hasOrgs$; // @todo remove this when store is properly cleaned on logout #320
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
  public addNewMovie(event: MouseEvent, org: { id: string, name: string}) {
    event.stopPropagation();
    this.dialog.open(TitleFormComponent, { data: org });
  }

  public delete(id: string) {
    this.service.remove(id);
  }
}
