import { Component, OnInit, Input} from '@angular/core';
import { interval, Observable } from "rxjs";
import { startWith } from 'rxjs/operators';
import { map } from "rxjs/operators";

interface timeComponents {
  minutesToDday: number;
  hoursToDday: number;
  daysToDday: number;
}

@Component({
  selector: 'event-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {
  public timeLeft$: Observable<timeComponents>;
  @Input() event;

  ngOnInit() {
    this.timeLeft$ = interval(1000).pipe(
      startWith(),
      map(_ => this.calcDateDiff()),
    )
  }

  calcDateDiff(): timeComponents {
    const dDay = this.event.start.valueOf();
  
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

    return { minutesToDday, hoursToDday, daysToDday };
  }
}
