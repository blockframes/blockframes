import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormList } from '@blockframes/utils/form/forms/list.form';
@Component({
  selector: '[form] movie-form-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeywordsComponent implements OnInit {
  @Input() form: FormList<string, AbstractControl>;
  keyword = new FormControl();
  values$: Observable<string[]>;
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  ngOnInit() {
    this.values$ = this.form.valueChanges.pipe(startWith(this.form.value));
  }

  public add(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.form.add(value)
    this.keyword.reset();
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }
}
