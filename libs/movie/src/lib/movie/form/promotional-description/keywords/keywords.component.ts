import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormArray, FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
@Component({
  selector: '[formArray] movie-form-keywords, [formArrayName] movie-form-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeywordsComponent implements OnInit {
  keyword = new FormControl();
  values$: Observable<string>;
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit() {
    this.values$ = this.keywords.valueChanges.pipe(startWith(this.keywords.value));
  }

  get keywords() : FormArray {
    return this.controlContainer.control as FormArray
  }

  public addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add keyword
    if ((value || '').trim()) {
      this.keywords.push(new FormControl(value.trim()));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeKeyword(i: number): void {
    this.keywords.removeAt(i);
  }
}
