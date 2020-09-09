import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: 'movie-form-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaImageComponent {
  form = this.shell.form;

  public movieId = this.route.snapshot.params.movieId;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
  ) { }

  addStill() {
    this.form.promotional
      .get('still_photo')
      .push(new HostedMediaForm());
  }

}
