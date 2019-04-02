import { Injectable } from "@angular/core";
import { providers } from "ethers";

import { network } from '@env';

@Injectable({ providedIn: 'root'})
export class Provider extends providers.BaseProvider {
  constructor() {
    super(network)
  }
}