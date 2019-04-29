import { Injectable } from '@angular/core';
import { network } from '@env';

import { providers, getDefaultProvider } from 'ethers';

@Injectable({ providedIn: 'root' })
export class Provider extends providers.FallbackProvider {
  constructor() {
    super([getDefaultProvider(network)]);
  }
}
