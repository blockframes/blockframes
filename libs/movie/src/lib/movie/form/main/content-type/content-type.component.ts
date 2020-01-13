import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { default as staticModels } from '../../../static-model/staticModels';
import { ControlContainer, FormControl } from '@angular/forms';
import { MovieMainForm } from '../main.form';


@Component({
  selector: '[form] movie-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeComponent implements OnInit {
  public staticModels: any;
  @Input() form: MovieMainForm;

  constructor(private controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
  }

  get title(): FormControl {
    return this.controlContainer.control as FormControl
  }
}
