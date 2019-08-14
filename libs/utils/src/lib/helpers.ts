import { toASCII } from "punycode";
import { baseEnsDomain, factoryContract } from "@env";
import { utils, providers } from "ethers";
import { ERC1077 } from '@blockframes/contracts';

export interface AddressParts {
  start: string;
  middle: string;
  end: string;
}

export interface Key {
  name: string,
  ensDomain: string,
  keyStore: string,
  address: string,
  isMainKey: boolean,
  isLinked: boolean, // does the key also exists inside the ERC1077
}

export function keyToAddressPart(key: Key, length: number): AddressParts {
  const { address } = JSON.parse(key.keyStore);
  return {start: address.slice(0, length), middle: address.slice(length, address.length - length), end: address.slice(-length)};
}

/** need it for calendar components */
export interface DateRange {
  from: Date;
  to: Date;
}

 /** check if a date is in a range */
 export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}
/** Get first part of an ens domain : `alice.blockframes.eth` -> `alice` */
export function getNameFromENS(ensDomain: string) {
  return ensDomain.split('.')[0];
}

/**
 * Convert email to username and sanitize it:
 * convert to lower case punycode and replace special chars by their ASCII code
 * then add base ens domain
 * @example `漢micHel+9@exemple.com` -> `xn--michel439-2c2s.blockframes.eth`
 */
// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export function emailToEnsDomain(email: string) { // !!!! there is a copy of this function in 'apps/backend-functions/src/relayer.ts'
  return toASCII(email.split('@')[0]).toLowerCase()
    .split('')
    .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
    .join('') + '.' + baseEnsDomain;
}

/**
 * This function precompute a contract address as defined in the EIP 1014 (Skinny Create 2)
 * @param ensDomain this is use as a salt (salt need to be unique for each user)
 * @param provider ethers provider
 */
// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export async function precomputeAddress(ensDomain: string, provider: providers.Provider) { // !!!! there is a copy of this function in 'apps/backend-functions/src/relayer.ts'

  const factoryAddress = await provider.resolveName(factoryContract);

  // CREATE2 address
  let payload = '0xff';
  payload += factoryAddress.substr(2);
  payload += utils.keccak256(utils.toUtf8Bytes(getNameFromENS(ensDomain))).substr(2); // salt
  payload += utils.keccak256(`0x${ERC1077.bytecode}`).substr(2);
  return `0x${utils.keccak256(payload).slice(-40)}`;
}
