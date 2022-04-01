// Angular
import { Component, Input, ContentChild, TemplateRef, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { Scope, staticModel } from '@blockframes/shared/model';
import { FormStaticValueArray } from '@blockframes/utils/form';

// RxJs
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: '[scope][control] input-autocomplete',
  templateUrl: './input-autocomplete.component.html',
  styleUrls: ['./input-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputAutocompleteComponent implements OnInit {
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  public state: Scope[];

  @Input() scope: Scope;
  @Input() control: FormStaticValueArray<Scope>;
  @Input() withoutValues: string[];

  public filteredStates: Observable<Scope[]>;

  /**
   * Since we input the scope we need to initialize the function after the input gets handled,
   * otherwise scope is undefined and this will throw an error
   */
  public displayFn: (name: string) => string;

  @ContentChild(TemplateRef) template: TemplateRef<unknown>;

  ngOnInit() {
    if (this.withoutValues) {
      this.state = Object.keys(staticModel[this.scope]).filter((keys) => !this.withoutValues.includes(keys)) as Scope[];
    } else {
      this.state = Object.keys(staticModel[this.scope]) as Scope[];
    }

    this.filteredStates = this.control.valueChanges
      .pipe(
        startWith(''),
        map((state: string) => state ? this.filterStates(state) : this.state),
      );
    this.displayFn = (name: string) => staticModel[this.scope][name];
  }

  private filterStates(value: string) {
    const filterValue = value.toLowerCase();
    return this.state.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}
