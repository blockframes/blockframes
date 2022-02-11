import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { combineLatest } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'financiers-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
  @ViewChild(DashboardTitleShellComponent) shell: DashboardTitleShellComponent;

  private dialogRef: MatDialogRef<unknown, unknown>;

  public movie$ = combineLatest([
    this.route.params.pipe(
      pluck('movieId'),
      switchMap((movieId: string) => this.movieService.valueChanges(movieId))
    ),
    this.router.events.pipe(startWith(false))
  ]).pipe(
    map(([movie]) => movie),
    tap(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(`${titleName}`, 'Marketplace Activity');
    })
  );

  public org$ = this.orgService.currentOrg$;

  public navLinks: RouteDescription[] = [
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

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private movieService: MovieService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private orgService: OrganizationService,
    private route: ActivatedRoute
  ) { }

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
