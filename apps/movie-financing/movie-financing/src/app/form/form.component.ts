import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'movie-financing-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
