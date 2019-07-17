import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MovieFormMainComponent {

  constructor(public controlContainer: ControlContainer) {}

}
