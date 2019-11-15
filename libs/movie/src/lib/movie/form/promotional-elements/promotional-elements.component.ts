import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MoviePromotionalElementsForm } from './promotional-elements.form';

@Component({
  selector: '[formGroup] movie-form-promotional-elements, [formGroupName] movie-form-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormPromotionalElementsComponent implements OnInit {

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {}

  get promotionalElements() : MoviePromotionalElementsForm {
    return this.controlContainer.control as MoviePromotionalElementsForm;
  }


}
