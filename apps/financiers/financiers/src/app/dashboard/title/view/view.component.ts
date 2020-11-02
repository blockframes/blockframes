import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { Campaign, CampaignService } from '@blockframes/campaign/+state';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CampaignForm } from '@blockframes/campaign/form/form';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';


const links: RouteDescription[] = [
  {
    path: 'main',
    label: 'Main Information'
  },
  {
    path: 'artistic',
    label: 'Artistic Information'
  },
  {
    path: 'production',
    label: 'Production Information'
  },
  {
    path: 'financing',
    label: 'Financial Elements'
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
export class TitleViewComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild(DashboardTitleShellComponent) shell: DashboardTitleShellComponent;
  private dialogRef: MatDialogRef<any, any>;
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public navLinks = links;
  public getLabelBySlug = getLabelBySlug;


  constructor(
    private movieQuery: MovieQuery,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  async openDialog() {
    const form = this.shell.getForm('campaign');
    const errorMatcher = new CrossFieldErrorMatcher();
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      minWidth: '50vw',
      data: {form, errorMatcher}
    });
  }

  async save() {
    this.dialogRef.close();
    this.shell.getConfig('campaign').onSave({ publishing: false });
  }
}
