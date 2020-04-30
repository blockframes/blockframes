import { FormArray, FormControl, FormGroup } from '@angular/forms';

export class FormFieldList extends FormGroup {

  constructor(private defaultTemplate) {
    super({
      first: new FormControl(),
      list: new FormArray([]),
    })
  }

  get first() {
    return this.get('first');
  }

  get list() {
    return this.get('list') as FormArray;
  }

  
  get value() {
    if (!this.isDefault(this.first.value)) {
      return [ this.first.value, ...this.list.value ]
    } else {
      return this.list.value.filter(v => !this.isDefault(v));
    }
  }

  isDefault(value): boolean {
    return deepEqual(this.defaultTemplate, value);
  }

  add(value) {
    if (!this.first.value) {
      this.first.setValue(value);
    } else {
      this.list.push(new FormControl(value));
    }
  }

  push(control: AbstractControl): void {
    if (this.isDefault(this.first.value)) {
      this.first.setValue(control.value);
    } else {
      this.list.push(control);
    }
  }

  insert(index: number, control: AbstractControl): void {
    if (index === 0) {
      const firstValue = this.first.value;
      this.list.insert(0, new FormControl(firstValue));
      this.first.setValue(control.value);
    } else {
      this.list.insert(index - 1, control);
    }
  }

  at(index) {
    return index === 0
      ? this.first
      : this.list.at(index - 1);
  }

  removeAt(index: number) {
    if (index === 0) {
      if (this.list.controls.length) {
        const control = this.list.at(0);
        this.list.removeAt(0)
        this.first.reset(control.value);
      } else {
        this.first.reset();
      }
    } else {
      this.list.removeAt(index - 1);
    }
  }  
  
  setControl(index: number, control: AbstractControl): void {
    if (index === 0) {
      this.first.setValue(control.value);
    } else {
      this.list.setControl(index - 1, control);
    }
  }

  setValue(value: any[]) {
    this.first.setValue(value.shift());
    this.list.setValue(value);
  }

  patchValue(value: any[]): void {
    this.first.patchValue(value.shift());
    this.list.patchValue(value);
  }

  reset(value: any = []): void {
    this.first.reset(value.shift());
    this.list.reset(value);
  }

  getRawValue(): any[] {
    if (!this.isDefault(this.first.value)) {
      return [ this.first.value, ...this.list.value ]
    } else {
      return this.list.getRawValue().filter(v => !this.isDefault(v));
    }
  }

  clear(): void {
    this.first.reset();
    this.list.clear();
  }




}