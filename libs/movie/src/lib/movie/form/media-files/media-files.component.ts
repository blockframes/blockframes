import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFilesComponent {
  form = this.shell.getForm('movie');

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute,
    private dynTitle: DynamicTitleService) {
      this.dynTitle.setPageTitle('Files')
     }

  get promotional() {
    return this.form.get('promotional');
  }

  public getPath(filePath: 'presentation_deck' | 'scenario' | 'moodboard') {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.${filePath}/`;
  }

}
