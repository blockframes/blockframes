import { Component, OnInit, Input } from '@angular/core';
import { MovieMainControl } from '../main.form';

@Component({
  selector: '[form] movie-form-total-runtime',
  templateUrl: './total-runtime.component.html',
  styleUrls: ['./total-runtime.component.scss']
})
export class TotalRuntimeComponent implements OnInit {

  @Input() form: MovieMainControl['totalRunTime'];

  constructor() { }

  ngOnInit() {
  }

}
