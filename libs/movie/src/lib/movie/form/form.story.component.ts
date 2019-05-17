import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';

@Component({
  selector: 'movie-form-story-section',
  templateUrl: './form.story.component.html',
  styleUrls: ['./form.story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormStoryComponent {

  @Input() movieForm: FormGroup;
  @Input() removeFormControl: any;
  @Input() addFormControl: any;
  @Input() keywords: FormArray;

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor() {}

  public addChip(event: MatChipInputEvent, object: string): void {
    const input = event.input;
    const value = event.value;

    // Add keyword
    if ((value || '').trim()) {
      this.addFormControl(new FormControl(value.trim()), object);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

}
