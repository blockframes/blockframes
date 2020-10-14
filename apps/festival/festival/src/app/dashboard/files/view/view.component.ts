import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

const navLinks = [
  {
    path: 'organization',
    label: 'Organization Resources'
  }
];

@Component({
  selector: 'festival-dashboard-files',
  templateUrl: 'view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesViewComponent implements OnInit {

  public navLinks = navLinks;

  constructor() { }

  ngOnInit() { }
}