import { Component, ChangeDetectionStrategy} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'waterfall-contracts-form',
  templateUrl: './contracts-form.component.html',
  styleUrls: ['./contracts-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsFormComponent {

  public form = new FormArray([
    new FormGroup({
      companyName: new FormControl(''),
      role: new FormControl(''),
    }),
  ]);

  add() {
    this.form.push(new FormGroup({
      companyName: new FormControl(''),
      role: new FormControl(''),
    }));
  }
  
  remove(index: number) {
    this.form.removeAt(index);
  }
}

