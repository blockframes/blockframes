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
import { OrganizationService } from '@blockframes/organization/+state';

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
  public org$ = this.orgService.currentOrg$;
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public navLinks = links;
  public sub: Subscription;
  public percentage = 0;

  constructor(
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
    private orgService: OrganizationService
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
}
