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
export class MovieFormMediaImagesComponent implements OnInit {
  form = this.shell.form;
  public movieId = this.route.snapshot.params.movieId;


  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (Object.keys(this.stillPhoto.value).length === 0) {
      this.addStill();
    }
  }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
  }

  addStill() {
    this.stillPhoto
      .push(new HostedMediaForm());
  }

  trackByFn(index: number) {
    return index;
  }
}
