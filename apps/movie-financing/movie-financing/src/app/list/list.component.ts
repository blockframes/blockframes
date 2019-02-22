import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'movie-financing-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
