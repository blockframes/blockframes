import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MovieFestivalPrizesForm } from './festival-prizes.form';


@Component({
  selector: '[formGroup] movie-form-festivalprizes, [formGroupName] movie-form-festivalprizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFestivalPrizesComponent {
  
  constructor(public controlContainer: ControlContainer) { }

  get festivalprizes() : MovieFestivalPrizesForm {
    return this.controlContainer.control as MovieFestivalPrizesForm;
  }


}
