import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'movie-financing-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
