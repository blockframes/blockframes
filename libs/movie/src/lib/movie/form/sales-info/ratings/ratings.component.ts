import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[form] movie-form-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
