import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { default as staticModels } from '../../static-model/staticModels';
import { MovieSalesCastForm } from './sales-cast.form';

@Component({
  selector: '[formGroup] movie-form-sales-cast, [formGroupName] movie-form-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesCastComponent implements OnInit {
  
  public staticModels: any;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
  }

  get salesCast() : MovieSalesCastForm {
    return this.controlContainer.control as MovieSalesCastForm;
  }

}
