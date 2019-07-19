import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'blockframes-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HomeComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }
}
