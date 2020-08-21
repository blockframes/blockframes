import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: 'movie-form-media-images',
  templateUrl: './media-images.component.html',
  styleUrls: ['./media-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaImagesComponent {
  form = this.shell.form;
  public movieId = this.route.snapshot.params.movieId;

  public displayedColumns = {
    stillPhoto: 'Photo',
  }

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get stillPhoto() {
    return this.promotional.get('still_photo');
  }

  get promotional() {
    return this.form.get('promotional');
  }

}
