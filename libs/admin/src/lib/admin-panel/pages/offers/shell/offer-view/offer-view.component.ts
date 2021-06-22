import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
