import { Component, OnInit } from '@angular/core';
import { DistributionRightForm } from './create.form';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class DistributionRightCreateComponent implements OnInit {

  public form = new DistributionRightForm();

  constructor() { }

  ngOnInit() {}

}
