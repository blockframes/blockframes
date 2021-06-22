import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
