import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { MovieSearch } from '../../search.form';

export const maxReleaseYear = 2030;

@Component({
  selector: '[form] filter-production-year',
  templateUrl: './production-year.component.html',
  styleUrls: ['./production-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionYearFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl;

  labels: FormControl;
  private sub: Subscription;
  maxReleaseYear = maxReleaseYear;
  search: number;

  ngOnInit() {
    // this.form.setValue(maxReleaseYear)
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // formatLabel(value: number) {
  //   const currentValue = value;
  //   if (currentValue == 1970) {
  //   return maxReleaseYear;
  //   }
  //   if (value < maxReleaseYear) {
  //    return maxReleaseYear - value;
  //   }
  // }

  // formatLabel(value: number) {
  //   const year = value;
  //   let i = 0;
  //   if (year == 1970) {
  //     return 2030;
  //   }
  //   if (year < 2030) {
  //     for (i; year < 2030; i--) {
  //       return year - 10;
  //     }
  //     return 2030 - 10;
  //   }
  // }

  // formatLabel(value: number) {
  //   if (value == 1970) {
  //     return 2030;
  //   }
  //   // let i = 0;
  //   // if (value < 2030) {
  //     for (value; value < 2030; value =- 10) {
  //       return value;
  //     // }

  //   }
  // }


  // displayLabel(value: number) {
  //   const test = new FormControl(this.search);
  //   if (value == 1970) {
  //     console.log('coucouPremier');
  //     test.markAsDirty;
  //    return test.setValue(2030)
  //     console.log('coucou!');
  //     console.log(test);
  //   } else if (value == 2030) {
  //     test.markAsDirty;
  //     return test.setValue(1970);
  //     console.log(test);
  //   }
  //   return test;
  // }

  // displayLabel(value: number) {
  //   const test = new FormControl();
  //   console.log(test);
  //   if (value == 1970) {
  //     test.setValue(2030);
  //     return 2030;
  //   }
  // }

  // displayLabel(value: number) {
  //   this.form = new FormControl();
  //    console.log(this.form);
  //    if (value == 1970) {
  //      this.form.setValue(2030);
  //      return 2030;
  //    }
  //  }

  // displayLabel(value: number) {
  //   this.form = new FormControl(value);
  //   const test = this.form.patchValue(value);
  //    console.log(this.form);
  //    return test;
  //  }

  displayLabel(value: number) {

    const array = ['1970', '1980', '1990', '2000', '2010', '2020', '2030' ];
    if (value == 1970) {
     this.form = new FormControl(array[0]);
     this.form.setValue(2030);
     this.form.valueChanges.pipe(
      map(res => !!res),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
     return array[6];
      console.log(this.form);

    }



   }

}


