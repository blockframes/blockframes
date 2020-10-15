// Angular
import { Component, Input, ContentChild, TemplateRef, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { Scope, staticConsts } from '@blockframes/utils/static-model';
import { FormConstantValue } from '@blockframes/utils/form';

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
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  public state: Scope[];

  public _scope: Scope;

  @Input() set scope(value: Scope) {
    this._scope = value;
  }
  @Input() control: FormConstantValue<Scope>;

  public filteredStates: Observable<Scope[]>;

  /**
   * Since we input the scope we need to initialize the function after the input gets handled,
   * otherwise _scope is undefined and this will throw an error
   */
  public displayFn: Function;

  @ContentChild(TemplateRef) template: TemplateRef<any>;

  ngOnInit() {
    this.state = Object.keys(staticConsts[this._scope]) as Scope[];
    this.filteredStates = this.control.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterStates(state) : this.state),
      );
    this.displayFn = (name: string) => {
      const res = this.state.find(entity => entity === name)
      return res ? res : '';
    }
  }

  private filterStates(value: string) {
    const filterValue = value.toLowerCase();
    return this.state.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}
