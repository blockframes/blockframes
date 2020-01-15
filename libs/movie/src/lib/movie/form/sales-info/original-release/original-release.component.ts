import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OriginalReleaseForm } from '../sales-info.form';

@Component({
  selector: 'movie-original-release',
  templateUrl: './original-release.component.html',
  styleUrls: ['./original-release.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginalReleaseComponent implements OnInit {

  @Input() form: OriginalReleaseForm;
  @Input() countryControl: FormControl;

  constructor() { }

  ngOnInit() {
    this.form.setControl('country', this.countryControl);
  }

}
