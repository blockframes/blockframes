import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaVideosComponent {
  form = this.shell.form;

  public otherLinksColumns = {
    name: 'Name',
    url: 'Link',
  }

  constructor(
    private shell: MovieFormShellComponent,
  ) { }

}
