import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { RouteDescription } from '@blockframes/model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pluck, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { ActivatedRoute } from '@angular/router';
import { UpdateFundingStatusModalComponent, UpdateFundingStatusModalData } from '../update-funding-status-modal/update-funding-status-modal.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'financiers-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent {
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
    this.dialogRef = this.dialog.open(UpdateFundingStatusModalComponent, {
      data: createModalData<UpdateFundingStatusModalData>({ form, errorMatcher, onSave: this.save })
    });
  }

  save = async () => {
    this.dialogRef.close();
    await this.shell.getConfig('campaign').onSave();
    this.snackbar.open('The funding status has been updated.', null, { duration: 1000 });
  }
}
