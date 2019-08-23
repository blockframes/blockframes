import { Key } from "libs/ethers/src/lib/key-manager/+state";

export interface AddressParts {
  start: string;
  middle: string;
  end: string;
}

export function keyToAddressPart(key: Key, length: number): AddressParts {
  const { address } = JSON.parse(key.keyStore);
  return {start: address.slice(0, length), middle: address.slice(length, address.length - length), end: address.slice(-length)};
}

/** need it for calendar components */
export interface CalendarRange {
  begin: Date;
  end: Date;
}

 /** check if a date is in a range */
 export function isBetween(date: Date, startRange: Date, endRange: Date){
  return date.getTime() >= startRange.getTime() && date.getTime() <= endRange.getTime();
}
