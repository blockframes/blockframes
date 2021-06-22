import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
