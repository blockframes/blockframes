// Angular
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';

// RxJs
import { Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';


@Component({
  selector: '[options][form] bf-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent implements OnInit {
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';

  @Input() label: string;
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() options: Observable<string[]>;
  @Input() form: FormControl<string>;

  public filteredStates: Observable<string[]>;

  ngOnInit() {
    this.filteredStates = combineLatest([
      this.form.valueChanges.pipe(startWith('')),
      this.options,
    ]).pipe(
      map(([state, options]) => state ? this.filterStates(state, options) : options),
    );
  }

  private filterStates(value: string, options: string[]) {
    const filterValue = value.toLowerCase();
    return options.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}
