import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { FORMS_CONFIG, ShellConfig } from '../form/movie.shell.interfaces';

@Injectable({ providedIn: 'root' })
export class MovieShellGuard implements CanActivate {
  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
  ) { }

  async canActivate() {
    this.configs.movie.onInit();
    await this.configs.campaign?.onInit();
    return true;
  }
}
