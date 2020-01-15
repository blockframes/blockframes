import { Component, OnInit, Input } from '@angular/core';
import { MovieMainControl } from '../main.form';

@Component({
  selector: 'movie-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {

  @Input() form: MovieMainControl['languages'];

  constructor() { }

  ngOnInit() {
  }

}
