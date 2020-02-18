pragma solidity ^0.5.9;

import "../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ERC1077.sol";

contract Factory2 is Ownable {

  event Deployed(address addr, uint256 salt);

  /**
  * @dev deploy a new contract through CREATE2, the address of the new contract depend only on SALT & CODE params
  * @param salt unique number for each user
  * @param code the byteCode of the contract to deploy (this correspond to the evm.bytecode key != deployed bytecode)
  * @param pubKey the first user key included in his smart-wallet (does NOT affect create2 deploy address)
  * @param recoverAddress whitelist the address that can destroy the user smart-wallet (does NOT affect create2 deploy address)
  */
  function deploy(uint256 salt, bytes memory code, address pubKey, address payable recoverAddress) public onlyOwner() returns(address) {
    address payable addr;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      addr := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
    ERC1077(addr).init(pubKey, recoverAddress);

    emit Deployed(addr, salt);
    return addr;
  }
}
