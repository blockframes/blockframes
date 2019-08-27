import { LocalTx, Tx } from "../../types";
import { utils } from "ethers";

/** Craft a transaction that will trigger the user ERC1077.deleteKey() function */
export function createDeleteKeyTx(erc1077Address:string, pubKey: string, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // deleteKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0x81dd7b8e000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }

  return {...tx, callback};
}

/** Craft a transaction that will trigger the user ERC1077.addKey() function */
export function createAddKeyTx(erc1077Address:string, pubKey: string, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: erc1077Address,
    value: '0x0',
    // addKey method hash (4 bytes) + arguments (key address (32 bytes) + purpose uint256 (32 bytes))
    data: `0xa2d39bdb000000000000000000000000${pubKey.substr(2)}0000000000000000000000000000000000000000000000000000000000000001`
  }
  
  return {...tx, callback};
}

export function createModifyQuorumTx(orgAddress: string, operationId: string, newQuorum: number, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    // admin_modifyQuorum(operationId uint256, newQuorum uint256)
    data: `0x0fc23ed2${utils.bigNumberify(operationId).toHexString().slice(2).padStart(64, '0')}${utils.bigNumberify(newQuorum).toHexString().slice(2).padStart(64, '0')}`
  }
  
  return {...tx, callback};
}

export function createAddMemberTx(orgAddress: string, operationId: string, memberAddress: string, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    // admin_addUserToWhitelist(operationId uint256, member address)
    data: `0xeb836708${utils.bigNumberify(operationId).toHexString().slice(2).padStart(64, '0')}${memberAddress.slice(2).padStart(64, '0')}`
  }
  
  return {...tx, callback};
}

export function createRemoveMemberTx(orgAddress: string, operationId: string, memberAddress: string, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    // admin_removeUserFromWhitelist(operationId uint256, member address)
    data: `0x1838a075${utils.bigNumberify(operationId).toHexString().slice(2).padStart(64, '0')}${memberAddress.slice(2).padStart(64, '0')}`
  }
  
  return {...tx, callback};
}

export function createApproveDeliveryTx(orgAddress: string, deliveryId: string, callback?: (...args) => void): LocalTx {
  const tx: Tx = {
    to: orgAddress,
    value: '0x0',
    // approve(hash bytes32, operationId uint256, to address, value uint256, data bytes)
    data: `0x2a66ad97${deliveryId.slice(2)}000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000ca5cade8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004ca5cade800000000000000000000000000000000000000000000000000000000`
  }
  
  return {...tx, callback};
}