import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieVersionInfoForm } from '@blockframes/movie/movieform/version-info/version-info.form';

@Component({
  selector: '[form] distribution-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealLanguagesComponent implements OnInit {
  @Input() from: MovieVersionInfoForm;

  ngOnInit() {
  }

}
