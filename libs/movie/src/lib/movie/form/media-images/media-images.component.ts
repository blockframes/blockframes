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
    // console.log('init');
    // console.log(this.stillPhoto);
    this.stillPhoto.valueChanges.subscribe(v => {
      console.log('change', v);
      if (!v.length) {
        console.log('need to populate')
        this.addStill();
        this.cdr.markForCheck();
      }
    });
    // if (!this.stillPhoto.controls.length) {
    //   this.addStill();
    // }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
  }

  addStill() {
    this.stillPhoto.push(new HostedMediaForm('', { privacy: 'public', collection: 'movies', docId: this.movieId, field: `promotional.still_photo[${this.stillPhoto.controls.length}]` }));
    // console.log('added');
    // console.log(this.stillPhoto);
  }

  trackByFn(index: number) {
    return index;
  }
}
