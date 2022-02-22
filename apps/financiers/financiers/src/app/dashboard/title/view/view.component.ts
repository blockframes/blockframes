import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pluck, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state';
import { ActivatedRoute } from '@angular/router';

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

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)));

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
