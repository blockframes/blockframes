import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

const pages = [{
  path: 'home',
  label: 'Homepage',
}];

@Component({
  selector: 'cms-festival',
  templateUrl: './festival.component.html',
  styleUrls: ['./festival.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FestivalComponent implements OnInit {
  pages = pages;
  constructor() { }

  ngOnInit(): void {
  }

}
