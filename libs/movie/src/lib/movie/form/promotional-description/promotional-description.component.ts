import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MoviePromotionalDescriptionForm } from './promotional-description.form';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
  selector: '[formGroup] movie-form-promotional-description, [formGroupName] movie-form-promotional-description',
  templateUrl: './promotional-description.component.html',
  styleUrls: ['./promotional-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormPromotionalDescriptionComponent {

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  constructor(public controlContainer: ControlContainer) { }

  get promotionalDescription() : MoviePromotionalDescriptionForm {
    return this.controlContainer.control as MoviePromotionalDescriptionForm;
  }


}
