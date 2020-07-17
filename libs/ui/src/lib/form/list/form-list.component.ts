// Angular
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '@blockframes/movie/form/sales-info/sales-info.form';

// Blockframes

@Component({
  selector: 'bf-form-list',
  templateUrl: 'form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent implements OnInit {

  formList = new MovieSalesInfoForm({scoring:'a', color: 'b', format: '16/9'})
  public localForm = this.formList; 
  
  constructor() { }

  ngOnInit() { }
}