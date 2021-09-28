import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,  
} from '@angular/animations';

function anim() {
  return trigger('testAnim', [
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

function anim2() {
  return trigger('testAnim2', [
    transition('false => *', [
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
  selector: 'counter-display',
  templateUrl: './counter-display.component.html',
  styleUrls: ['./counter-display.component.scss'],
  animations: [anim(), anim2()]
})
export class CounterDisplayComponent implements OnChanges {
  @Input() minutesLeft: number;
  @Input() hoursLeft: number;
  @Input() daysLeft: number;

  public minutes: number
  public hours: number
  public days: number
  public newMinutes: number | boolean;
  public newHours: number | boolean;
  public newDays: number | boolean;

  ngOnChanges(changes: SimpleChanges) {
    if(changes['minutesLeft']) {
      this.newMinutes = changes['minutesLeft'].currentValue;
    }
    if(changes['hoursLeft']) {
      this.newHours = changes['hoursLeft'].currentValue;
    }
    if(changes['daysLeft']) {
      this.newDays = changes['daysLeft'].currentValue;
    }
  }

  onAnimationDone() {
    if (this.newMinutes !== false) {
      this.minutes = this.newMinutes as number;
      this.newMinutes = false;
    }

    if (this.newHours !== false) {
      this.hours = this.newHours as number;
      this.newHours = false;
    }

    if (this.newDays !== false) {
      this.days = this.newDays as number;
      this.newDays = false;
    }
  }
}



