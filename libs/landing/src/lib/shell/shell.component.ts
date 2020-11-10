import { ChangeDetectionStrategy, Component, OnInit, Directive } from '@angular/core';

@Component({
  selector: 'landing-shell',
  templateUrl: 'shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingShellComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}

@Component({
  selector: 'shell-header',
  template: '<ng-content></ng-content>',
  styles: [`:host {
  display: block;
  padding-top: calc(var(--toolbarHeight) + 100px);
  padding-bottom: 100px;
  padding-left: 20%;
  padding-right: 20%;
  background-size: cover;
}`]
})
export class HeaderShellComponent { }

@Directive({
  selector: 'shell-usp',
})
export class ShellUSPComponent { }