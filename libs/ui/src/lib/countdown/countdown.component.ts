import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { interval, Observable } from "rxjs";
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';
import { Easing } from '@blockframes/utils/animations/animation-easing';

interface TimeObservable {
  days: Observable<string>,
  hours: Observable<string>,
  minutes: Observable<string>,
  seconds: Observable<string>
}

function slideUp() {
  return trigger('slideUp', [
    transition(':decrement, :increment', [
      animate(`50ms ${Easing.easeIncubic}`, style({ opacity: 0, transform: 'translateY(100%)' })),
      animate('10ms', style({ transform: 'translateY(-100%)' })),
      animate(`150ms ${Easing.easeOutcubic}`, style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ])
}

function toSeconds(delta: number) {
  const sec = Math.floor((delta / 1000) % 60);
  return sec.toString().padStart(2, "0");
}

function toMinutes(delta: number) {
  const min = Math.floor((delta / (1000 * 60)) % 60);
  return min.toString().padStart(2, "0");
}

function toHours(delta: number) {
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24)
  return hours.toString().padStart(2, "0");
}

function toDays(delta: number) {
  const days = Math.floor(delta / (1000 * 60 * 60 * 24))
  return days.toString().padStart(2, "0");
}
@Component({
  selector: '[date][timeUnits][title] countdown-timer',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  animations: [slideUp()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements OnInit {

  @Input() date: Date;
  @Input() timeUnits: (keyof TimeObservable)[];
  @Input() title: string;
  /** Emit a boolean when timer reach zero */
  @Output() timerEnded = new EventEmitter<boolean>();
  private _ended = false;

  public time: TimeObservable;
  public seconds$: Observable<string>;
  public minutes$: Observable<number>;
  public hours$: Observable<number>;
  public days$: Observable<number>;

  ngOnInit() {
    const delay$ = interval().pipe(
      map(() => this.calcDateDiff()),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    const seconds$ = delay$.pipe(
      map(toSeconds),
    );

    const minutes$ = delay$.pipe(
      map(toMinutes),
      distinctUntilChanged()
    );

    const hours$ = delay$.pipe(
      map(toHours),
      distinctUntilChanged()
    );

    const days$ = delay$.pipe(
      map(toDays),
      distinctUntilChanged()
    );

    this.time = {
      seconds: seconds$,
      minutes: minutes$,
      hours: hours$,
      days: days$
    }
  }

  calcDateDiff() {
    const oneMin = 60 * 1000;
    const dDay = this.date.valueOf() + oneMin;
    const timeDifference = dDay - Date.now();
    if (timeDifference - oneMin <= 0 && !this._ended) {
      this._ended = true; // To emit only once
      this.timerEnded.emit(true);
    }
    return timeDifference >= 0 ? timeDifference : 0;
  }
}


