import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MoviePromotionalDescriptionForm } from './synopsis-keyassets.form';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
  selector: '[formGroup] movie-form-promotional-description, [formGroupName] movie-form-promotional-description',
  templateUrl: './synopsis-keyassets.component.html',
  styleUrls: ['./synopsis-keyassets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSynopsisKeyAssetsComponent {

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public controlContainer: ControlContainer) { }

  get promotionalDescription() : MoviePromotionalDescriptionForm {
    return this.controlContainer.control as MoviePromotionalDescriptionForm;
  }


}
