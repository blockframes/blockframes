import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'landing-shell-page',
  templateUrl: 'shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingShellComponent { }

@Component({
  selector: 'shell-header',
  template: '<ng-content></ng-content>',
  host: {
    class: 'dark-contrast-theme'
  },
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

@Component({
  selector: 'shell-content',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: block;
    margin: 48px 20% 0;
}`]
})
export class ShellContentComponent { }

@Component({
  selector: 'shell-contact',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: block;
    padding: 0 20%;
  }`]
})
export class ShellContactComponent { }

@Component({
  selector: 'shell-footer',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 48px 0;
  }`]
})
export class ShellFooterComponent { }