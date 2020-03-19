// Angular
import { Component, Input, ContentChild, TemplateRef, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { FormStaticValue } from '@blockframes/utils/form';
import { Scope, SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { staticModels } from '@blockframes/utils/static-model';

// RxJs
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: '[scope][control]input-autocomplete',
  templateUrl: './input-autocomplete.component.html',
  styleUrls: ['./input-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputAutocompleteComponent implements OnInit {
  @Input() label?: string;

  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  public _scope: SlugAndLabel[];

  @Input() set scope(value: string) {
    this._scope = staticModels[value];
  }
  @Input() control: FormStaticValue<Scope>;

  public filteredStates: Observable<SlugAndLabel[]>;

  /**
   * Since we input the scope we need to initalize the function after the input gets handled,
   * otherwise _scope is undefined and this will throw an error
   */
  public displayFn: Function;

  @ContentChild(TemplateRef) template: TemplateRef<any>;

  ngOnInit() {
    this.filteredStates = this.control.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterStates(state) : this._scope.slice()),
      );
    this.displayFn = (name: string) => {
      const res = this._scope.find(entity => entity.slug === name)
      return res ? res.label : '';
    }
  }

  private filterStates(value: string) {
    const filterValue = value.toLowerCase();
    return this._scope.filter(state => state.slug.toLowerCase().indexOf(filterValue) === 0);
  }
}
