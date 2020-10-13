import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: 'movie-form-media-images',
  templateUrl: './media-images.component.html',
  styleUrls: ['./media-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaImagesComponent {
  form = this.shell.getForm('movie');
  public movieId = this.route.snapshot.params.movieId;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (!this.stillPhoto.controls.length) {
      this.addStill();
    }
  }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
  }

  addStill() {
    this.stillPhoto.push(new HostedMediaForm());
  }

  trackByFn(index: number) {
    return index;
  }
}
