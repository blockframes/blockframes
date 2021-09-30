import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { interval, Subscription } from "rxjs";
import { tap, startWith } from 'rxjs/operators';
import {
  trigger,
  style,
  animate,
  transition,  
} from '@angular/animations';

function tempAnim() {
  return trigger('tempNumberAnim', [
    transition(':enter', [
      style({
        bottom: '-100%',
      }),
      animate(
        '0.8s',
        style({
          bottom: '0',
        })
      ),
    ]),
  ]);
}

function anim() {
  return trigger('numberAnim', [
    transition('-1 => *', [
      animate(
        '0.8s',
        style({
          bottom: '100%',
        })
      ),
    ]),
  ]);
}

@Component({
  selector: '[date][timeUnits] countdown-timer',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  animations: [tempAnim(), anim()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements OnInit, OnDestroy {
  /* 
  This component is an adaptable countdown : 
  It will only display the time units that it will receive as a property array :
  example : ['hours', 'minutes']
  It also needs a date property to calculate the end of the countdown
  */ 
  @Input() date: Date;
  @Input() timeUnits: ('days' | 'hours' | 'minutes' | 'seconds')[];
  private subscription: Subscription;
  
  /*  
  Important : As we sometime need to display a "0" value, we cannot use 0 as "false" value.
  Here we'll use -1 to express false or undefined. 
  */
  public time = {
    days: { current: -1, new: -1},
    hours: { current: -1, new: -1},
    minutes: { current: -1, new: -1},
    seconds: { current: -1, new: -1}
  }

  constructor(private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscription = interval(1000).pipe(
      startWith(0),
      tap(_ => this.calcDateDiff()),
    ).subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  calcDateDiff() {
    const dDay = this.date.valueOf();
    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;
  
    const timeDifference = dDay - Date.now();

    const _time = {
      days: Math.floor(timeDifference / (milliSecondsInASecond * minutesInAnHour * secondsInAMinute * hoursInADay)),
      hours: Math.floor((timeDifference / (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) % hoursInADay),
      minutes: Math.floor((timeDifference / (milliSecondsInASecond * minutesInAnHour)) % secondsInAMinute),
      seconds: Math.floor((timeDifference / milliSecondsInASecond)) % secondsInAMinute
    }

    for (const unit of this.timeUnits) {
      if (this.time[unit].current !== _time[unit]) {
        this.time[unit].new = _time[unit];
      }
    }

    this.ref.markForCheck();
  }

  onAnimationDone() {
    for(const unit of this.timeUnits) {
      if(this.time[unit].new > -1) {
        this.time[unit].current = this.time[unit].new;
        this.time[unit].new = -1
      }
    }
  }
}
