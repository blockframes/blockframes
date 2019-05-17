import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'movie-form-promotional-section',
  templateUrl: './form.promotional.component.html',
  styleUrls: ['./form.promotional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormPromotionalComponent {

  @Input() movieForm: FormGroup;
  @Input() images: FormArray;
  @Input() promotionalElements: FormArray;
  @Input() removeFormControl: any;
  @Input() addFormControl: any;
  @Input() currentFormValue: any;

  constructor(
    private builder: FormBuilder,
  ) {}

  public setImage(image: string, index: number): void {
    this.images.controls[index].setValue(image);
  }

  public addImage(): void {
    this.addFormControl(new FormControl(''), 'images');
  }

  public addPromotionalElement(): void {
    const defaultFormGroup = { label: '', url: ''};
    this.addFormControl(this.builder.group(defaultFormGroup), 'promotionalElements');
  }

}
