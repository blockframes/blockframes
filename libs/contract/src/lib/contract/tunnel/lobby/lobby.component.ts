import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'contract-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  select(type: 'sale' | 'mandate') {
    console.log(type);
  }
}
