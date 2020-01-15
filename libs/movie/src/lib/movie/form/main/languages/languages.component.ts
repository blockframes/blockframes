import { Component, OnInit, Input } from '@angular/core';
import { MovieMainControl } from '../main.form';
import { default as staticModel } from '../../../static-model/staticModels';

@Component({
  selector: 'movie-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {

  @Input() form: MovieMainControl['languages'];
  languages = staticModel.LANGUAGES;

  constructor() { }

  ngOnInit() {
  }

}
