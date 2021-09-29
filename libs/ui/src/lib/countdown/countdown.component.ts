import { Component, OnInit, Input} from '@angular/core';
import { interval, Observable } from "rxjs";
import { startWith, tap } from 'rxjs/operators';
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
  selector: 'event-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  animations: [tempAnim(), anim()]
})
export class CountdownComponent implements OnInit {
  public timeLeft$: Observable<number>;
  @Input() date;
  public minutes: number
  public hours: number
  public days: number
  public newMinutes: number ;
  public newHours: number ;
  public newDays: number ;

  ngOnInit() {
    this.timeLeft$ = interval(1000).pipe(
      startWith(),
      tap(() => this.calcDateDiff()),
    )
  }

  calcDateDiff() {
    const dDay = this.date.valueOf();
  
    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;
  
    const timeDifference = dDay - Date.now();
  
    const daysToDday = Math.floor(
      timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute * hoursInADay)
    );
  
    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
        hoursInADay
    );
  
    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
        secondsInAMinute
    );

    if(this.minutes !== minutesToDday) {
      this.newMinutes = minutesToDday;
    }
    if(this.hours !== hoursToDday) {
      this.newHours = hoursToDday;
    }
    if(this.days !== daysToDday) {
      this.newDays = daysToDday;
    }
  }

  onAnimationDone() {
    if (this.newMinutes > -1) {
      this.minutes = this.newMinutes as number;
      this.newMinutes = -1;
    }

    if (this.newHours > -1) {
      this.hours = this.newHours as number;
      this.newHours = -1;
    }

    if (this.newDays > -1) {
      this.days = this.newDays as number;
      this.newDays = -1;
    }
  }
}
