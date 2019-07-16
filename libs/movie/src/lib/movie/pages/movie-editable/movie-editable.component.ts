import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MovieQuery } from '../../+state';
import { FormGroupLike } from '@datorama/akita';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';

@Component({
  selector: 'movie-editable',
  templateUrl: './movie-editable.component.html',
  styleUrls: ['./movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEditableComponent implements OnInit, OnDestroy {
  public fullScreen = false;
  public form: FormGroupLike;
  private isAlive = true;

  constructor(
    private query: MovieQuery,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.query.movieFormChanges$
    .pipe(takeWhile(() => this.isAlive))
    .subscribe(form => {
      this.form = form;
      this.cdRef.detectChanges(); // required on first component load
    });
  }

  public toggleFullScreen() {
    return this.fullScreen = !this.fullScreen;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
