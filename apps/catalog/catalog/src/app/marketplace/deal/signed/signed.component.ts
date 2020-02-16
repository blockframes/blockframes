import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-signed',
  templateUrl: './signed.component.html',
  styleUrls: ['./signed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignedComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
