import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-media-images',
  templateUrl: './media-images.component.html',
  styleUrls: ['./media-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaImagesComponent implements OnInit, OnDestroy {

  public form = this.shell.getForm('movie');
  public movieId = this.route.snapshot.params.movieId;

  private sub: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dynTitle.setPageTitle('Images')
  }

  ngOnInit() {
    this.stillPhoto.valueChanges.subscribe(v => {
      if (!v.length) {
        this.addStill();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
  }

  addStill() {
    this.stillPhoto.push(new HostedMediaForm('', { privacy: 'public', collection: 'movies', docId: this.movieId, field: `promotional.still_photo[${this.stillPhoto.controls.length}]` }));
  }

  trackByFn(index: number) {
    return index;
  }
}
