import { LocalTx, Tx } from "../../types";
import { FeedbackMessage } from "@blockframes/ui";

export function getMockTx(callback: (...args) => void): LocalTx { // TODO remove after issue#655
  const tx: Tx = {
    to: '0x0000000000000000000000000000000000000000',
    value: '0x0',
    data: `0xca5cade8`
  }
  // TODO: delete FeedbackMessage
  const message: FeedbackMessage = {
    headline: 'Congratulation !',
    subline: 'Your transaction was successfully sent to the Blockchain !',
    isError: false,
  };

  return {...tx, message, callback};
}

/** Craft a transaction that will trigger the user ERC1077.deleteKey() function */
export function getDeleteKeyTx(erc1077Address:string, pubKey: string, callback: (...args) => void): LocalTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // deleteKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0x81dd7b8e000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }
  const message: FeedbackMessage = {
    headline: 'Congratulation !',
    subline: 'Your key was successfully deleted !',
    isError: false,
  };

  return {...tx, message, callback};
}

/** Craft a transaction that will trigger the user ERC1077.addKey() function */
export function getAddeKeyTx(erc1077Address:string, pubKey: string, callback: (...args) => void): LocalTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // addKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0xa2d39bdb000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }
  const message: FeedbackMessage = {
    headline: 'Congratulation !',
    subline: 'Your key was successfully created !',
    isError: false,
  };

  return {...tx, message, callback};
}

// TODO define "sign delivery" tx
