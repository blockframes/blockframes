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

  public add(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.keywords.push(new FormControl(value))
    this.keyword.reset();
  }

  public remove(i: number): void {
    this.keywords.removeAt(i);
  }
}
