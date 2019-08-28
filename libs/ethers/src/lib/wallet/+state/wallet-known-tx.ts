import { ActionTx, Tx } from "../../types";
import { numberTo256Bits, padTo256Bits } from "@blockframes/utils";

/** Craft a transaction that will trigger the user ERC1077.deleteKey() function */
export function createTx_DeleteKey(erc1077Address:string, pubKey: string, callback?: (...args) => void): ActionTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // deleteKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0x81dd7b8e000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }

  return {...tx, callback};
}

/** Craft a transaction that will trigger the user ERC1077.addKey() function */
export function createTx_AddKey(erc1077Address:string, pubKey: string, callback?: (...args) => void): ActionTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // addKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0xa2d39bdb000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }
  
  return {...tx, callback};
}

/** Craft a transaction that will trigger the Organization.admin_modifyQuorum() function */
export function createTx_ModifyQuorum(orgAddress: string, operationId: string, newQuorum: number, callback?: (...args) => void): ActionTx {

  const extendedOperationId = padTo256Bits(operationId).slice(2);
  const extendedQuorum = numberTo256Bits(newQuorum).slice(2);
  const payload = `${extendedOperationId}${extendedQuorum}`;

  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    data: `0x0fc23ed2${payload}` // admin_modifyQuorum(operationId uint256, newQuorum uint256)
  }
  
  return {...tx, callback};
}

/** Craft a transaction that will trigger the Organization.admin_addUserToWhitelist() function */
export function createTx_AddMember(orgAddress: string, operationId: string, memberAddress: string, callback?: (...args) => void): ActionTx {

  const extendedOperationId = padTo256Bits(operationId).slice(2);
  const extendedMemberAddress = padTo256Bits(memberAddress).slice(2);
  const payload = `${extendedOperationId}${extendedMemberAddress}`;

  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    data: `0xeb836708${payload}` // admin_addUserToWhitelist(operationId uint256, member address)
  }
  
  return {...tx, callback};
}

/** Craft a transaction that will trigger the Organization.admin_removeUserFromWhitelist() function */
export function createTx_RemoveMember(orgAddress: string, operationId: string, memberAddress: string, callback?: (...args) => void): ActionTx {

  const extendedOperationId = padTo256Bits(operationId).slice(2);
  const extendedMemberAddress = padTo256Bits(memberAddress).slice(2);
  const payload = `${extendedOperationId}${extendedMemberAddress}`;

  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    data: `0x1838a075${payload}` // admin_removeUserFromWhitelist(operationId uint256, member address)
  }
  
  return {...tx, callback};
}

/** Craft a transaction that will trigger the Organization.approve() function with the sign delivery operation parameters*/
export function createTx_ApproveDelivery(orgAddress: string, deliveryId: string, callback?: (...args) => void): ActionTx {
  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    // approve(hash bytes32, operationId uint256, to address, value uint256, data bytes)
    data: `0x2a66ad97${deliveryId.slice(2)}000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000ca5cade8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004ca5cade800000000000000000000000000000000000000000000000000000000`
  }
  
  return {...tx, callback};
}