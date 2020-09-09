// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

// Blockframes
import { HostedMediaFormValue } from '@blockframes/media/+state/media.firestore';

import { MovieForm } from '../../../../form/movie.form';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[form] movie-summary-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryImageComponent implements OnInit, OnDestroy {
  @Input() form: MovieForm;
  @Input() link: string;

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.form.promotional.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get photoHasNoValue() {
    try {
      const stillPhotos: Record<string, HostedMediaFormValue> = this.form.promotional.get('still_photo').value;
      const keys = Object.keys(stillPhotos);

      // if there is no still photos
      return keys.length === 0 ?
        true :
        // or if at least one still photo as an empty url
        keys.some(key => !stillPhotos[key].ref);

    } catch (error) {
      console.warn(error);
      return true;
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
