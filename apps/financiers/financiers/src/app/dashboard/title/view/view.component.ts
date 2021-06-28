import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CampaignService } from '@blockframes/campaign/+state';
import { filter, switchMap } from 'rxjs/operators';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Router } from '@angular/router';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state';
import { getAppName, getCurrentApp, getMovieAppAccess } from '@blockframes/utils/apps';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';


const links: RouteDescription[] = [
  {
    path: 'activity',
    label: 'Marketplace'
  },
  {
    path: 'main',
    label: 'Main'
  },
  {
    path: 'production',
    label: 'Production'
  },
  {
    path: 'artistic',
    label: 'Artistic'
  },
  {
    path: 'additional',
    label: 'Additional'
  },
  {
    path: 'financing',
    label: 'Financial'
  },
  {
    path: 'campaign',
    label: 'Investment',
  }
];

@Component({
  selector: 'financiers-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit, OnDestroy {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
  @ViewChild(DashboardTitleShellComponent) shell: DashboardTitleShellComponent;
  private dialogRef: MatDialogRef<unknown, unknown>;
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public navLinks = links;
  public sub: Subscription;
  public percentage = 0;

  public org$ = this.orgQuery.selectActive();
  public appName = getCurrentApp(this.routerQuery);

  constructor(
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private routerQuery: RouterQuery,
    private snackbar: MatSnackBar,
    private campaignService: CampaignService,
    private movieService: MovieService,
    private router: Router,
    private orgQuery: OrganizationQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
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
    this.snackbar.open('The funding status has been updated.', null, { duration: 1000 });
  }

  removeAppAccess() {
    const movie = this.movieQuery.getActive();
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

          const ref = this.snackbar.open('Title deleted.', '', { duration: 4000 });
          ref.afterDismissed().subscribe(() => this.router.navigate(['/c/o/dashboard/title']));
        }
      }
    })
  }

  async updateStatus(status: StoreStatus, message?: string) {
    const movie = this.movieQuery.getActive();
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
      this.snackbar.open(message, '', { duration: 4000 });
    } else {
      this.snackbar.open(`Title ${storeStatus[status]}.`, '', { duration: 4000 });
    }
  }
}
