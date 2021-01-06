import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { allowedFiles } from '@blockframes/utils/utils';

@Component({
  selector: 'campaign-form-profits',
  templateUrl: './profits.component.html',
  styleUrls: ['./profits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormProfitsComponent implements OnInit {
  storagePath: string;
  form = this.shell.getForm('campaign');
  errorMatcher = new CrossFieldErrorMatcher();

  public allowedFilesTypes = allowedFiles.pdf.mime;
  public allowedFilesExtensions = allowedFiles.pdf.extension;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Return on Investment')
  }

  get profits() {
    return this.form.get('profits');
  }

  ngOnInit() {
    const { movieId } = this.route.snapshot.params;
    this.storagePath = `campaigns/${movieId}/files.waterfall/`;
  }
}
