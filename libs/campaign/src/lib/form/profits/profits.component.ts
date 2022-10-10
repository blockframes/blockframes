import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { allowedFiles } from '@blockframes/model';

@Component({
  selector: 'campaign-form-profits',
  templateUrl: './profits.component.html',
  styleUrls: ['./profits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormProfitsComponent {
  movieId = this.route.snapshot.params.movieId;
  form = this.shell.getForm('campaign');
  errorMatcher = new CrossFieldErrorMatcher();

  public allowedFilesTypes = allowedFiles.pdf.mime;
  public allowedFilesExtensions = allowedFiles.pdf.extension;

  constructor(
    public shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Return on Investment')
  }

  get profits() {
    return this.form.get('profits');
  }
}
