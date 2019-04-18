import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MovieService } from '../+state';
import { Observable } from 'rxjs';
import { OrganizationQuery, OrganizationWithMovies, Organization } from '@blockframes/organization';
import { MatDialog } from '@angular/material/dialog';
import { TitleFormComponent } from '../title-form/title-form.component';
import { takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'movie-financing-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  orgs$: Observable<OrganizationWithMovies[]>;
  isAlive= true;


  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog
  ) {}

  // Initiate the Movies in Akita
  ngOnInit() {
    this.service.moviesOfOrganizations$.pipe(takeWhile(() => this.isAlive)).subscribe();
    this.orgs$ = this.orgQuery.orgsWithMovies$;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
  public addNewMovie(orgId, orgName) {
    this.dialog.open(TitleFormComponent, { data: { id: orgId, name: orgName } });
  }

  public delete(id: string) {
    this.service.remove(id);
  }

  public trackOrgs(index: number, org: Organization) {
    return org.id;
  }
}
