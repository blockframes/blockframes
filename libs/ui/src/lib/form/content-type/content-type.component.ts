import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormStaticValue } from '@blockframes/utils/form';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { contentType, ContentType } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] form-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormContentTypeComponent implements OnInit {
  @Input() form: FormStaticValue<'contentType'>;

  contentType = contentType;
  contentTypes: ContentType[];
  filteredTypes$: Observable<ContentType[]>;

  ngOnInit() {
    this.contentTypes = Object.keys(contentType) as ContentType[]

    this.filteredTypes$ = this.form.valueChanges
      .pipe(
        startWith(''),
        map((type: ContentType) => type ? this._filter(type) : this.contentTypes)
      );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    if (key) {
      return contentType[key];
    }
  }

  private _filter(type: string) {
    const filterValue = type.toLowerCase();
    return this.contentTypes.filter(contentType => contentType.toLowerCase().indexOf(filterValue) === 0) as ContentType[]
  }
}
