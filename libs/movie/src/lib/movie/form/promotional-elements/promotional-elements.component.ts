import { Component, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MoviePromotionalElementsForm } from './promotional-elements.form';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[formGroup] movie-form-promotional-elements, [formGroupName] movie-form-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
})
export class MovieFormPromotionalElementsComponent implements OnInit {
  public staticModels: any;

  constructor(public controlContainer: ControlContainer) {
    this.staticModels = staticModels;
  }

  ngOnInit() { }

  get promotionalElements(): MoviePromotionalElementsForm {
    return this.controlContainer.control as MoviePromotionalElementsForm;
  }


}
