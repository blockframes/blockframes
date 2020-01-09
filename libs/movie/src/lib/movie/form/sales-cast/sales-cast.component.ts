import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl, FormArray } from '@angular/forms';
import { ControlContainer } from '@angular/forms';
import { default as staticModels } from '../../static-model/staticModels';
import { MovieSalesCastForm } from './sales-cast.form';

function getFirstLastName(name: string) {
  const fullname = name.split(/\s+/);
  const firstname = fullname[0];
  const lastname = fullname[1];
  return { firstname, lastname }
}

function sepereatedByComma(input){
  let arr = [];
  if (input.indexOf(',') > -1) {
    arr = input.split(',')
  }
  return arr;
}
@Component({
  selector: '[formGroup] movie-form-sales-cast, [formGroupName] movie-form-sales-cast, [form] movie-form-sales-cast, movie-form-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class MovieFormSalesCastComponent {
    @Input() form: FormControl;
    @Input() role: string;
    name = new FormControl();
  public staticModels: any;

  // constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
  }

  update(name){
    console.log(sepereatedByComma(name))
    const list = sepereatedByComma(name)
    const listOfObj = list.map((i) => getFirstLastName(i))
    console.log(listOfObj);
  }

  // get salesCast() : MovieSalesCastForm {
  //   return this.controlContainer.control as MovieSalesCastForm;
  // }

}
