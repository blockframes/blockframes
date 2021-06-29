import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { Movie, MovieQuery, MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getAppName, getCurrentApp, getMovieAppAccess } from '@blockframes/utils/apps';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';
import { DashboardTitleShellComponent } from '../shell/shell.component';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { CampaignService } from '@blockframes/campaign/+state';


@Component({
  selector: 'actions-dashboard-shell',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardActionsShellComponent implements OnInit, OnDestroy {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
  @ViewChild(DashboardTitleShellComponent) shell: DashboardTitleShellComponent;
  movie$ = this.query.selectActive();

  public appName = getCurrentApp(this.routerQuery);
  public org$ = this.orgQuery.selectActive();
  public movie: Observable<Movie>;
  public loading$: Observable<boolean>;
  private dialogRef: MatDialogRef<unknown, unknown>;
  public sub: Subscription;
  public percentage = 0;


  constructor(
    private query: MovieQuery,
    private routerQuery: RouterQuery,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading$ = this.query.selectLoading();
    this.movie = this.query.selectActive();
    this.sub = this.movie$.pipe(
      switchMap(movie => this.campaignService.getValue(movie.id)),
      filter(campaign => !!campaign)
    ).subscribe(data => {
      this.percentage = Math.floor((data.received / data.cap) * 100);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  removeAppAccess() {
    const movie = this.query.getActive();
    const appsName = getMovieAppAccess(movie).map(a => getAppName(a).label);
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: `You are about to delete ${movie.title.international} permanently.`,
        subtitle: `This Title will still be available on <i>${appsName.join(', ')}</i>.<br/> If you wish to proceed, please type "DELETE" in the field below.`,
        confirmationWord: 'delete',
        confirmButtonText: 'delete title',
        cancelButtonText: 'keep title',
        onConfirm: async () => {
          await this.movieService.update(movie.id, movie => ({
            ...movie,
            app: {
              ...movie.app,
              [this.appName]: {
                ...movie.app[this.appName],
                access: false
              }
            }
          }));

          const ref = this.snackBar.open('Title deleted.', '', { duration: 4000 });
          ref.afterDismissed().subscribe(() => this.router.navigate(['/c/o/dashboard/title']));
        }
      }
    })
  }

  async updateStatus(status: StoreStatus, message?: string) {
    const movie = this.query.getActive();
    await this.movieService.update(movie.id, movie => ({
      ...movie,
      app: {
        ...movie.app,
        [this.appName]: {
          ...movie.app[this.appName],
          status: status
        }
      }
    }));

    if (message) {
      this.snackBar.open(message, '', { duration: 4000 });
    } else {
      this.snackBar.open(`Title ${storeStatus[status]}.`, '', { duration: 4000 });
    }
  }

  async openDialog() {
    const form = this.shell.getForm('campaign');
    const errorMatcher = new CrossFieldErrorMatcher();
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      minWidth: '50vw',
      data: { form, errorMatcher }
    });
  }

  async save() {
    this.dialogRef.close();
    await this.shell.getConfig('campaign').onSave();
    this.snackBar.open('The funding status has been updated.', null, { duration: 1000 });
  }

}
