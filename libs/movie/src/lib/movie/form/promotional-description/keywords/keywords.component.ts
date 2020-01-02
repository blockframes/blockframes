import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlContainer, FormArray, FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: '[formArray] movie-form-keywords, [formArrayName] movie-form-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeywordsComponent implements OnInit {
  keyword = new FormControl();
  values$: Observable<string>; //  = this.keywords.valueChanges.pipe(startWith(this.keywords.value));

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit() {
    this.values$ = this.keywords.valueChanges.pipe(startWith(this.keywords.value));
  }

  get keywords() : FormArray {
    return this.controlContainer.control as FormArray
  }

  add() {
    const v = this.keyword.value;
    this.keywords.push(new FormControl(v))
    this.keyword.reset();
  }
}
