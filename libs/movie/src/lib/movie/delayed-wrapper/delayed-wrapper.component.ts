import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'movie-delayed-wrapper',
  templateUrl: './delayed-wrapper.component.html',
  styleUrls: ['./delayed-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DelayedWrapperComponent {

  public isLoading$: Observable<boolean>;

  constructor() {
    this.isLoading$ = new Observable(subscriber => {
      subscriber.next(true)
      setTimeout(() => {
        subscriber.next(false)
      }, 1000)
    })
  }
}
