pragma solidity ^0.5.9;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initable.sol";

contract Factory2 is Ownable {
  bytes private initCode;
  bytes private byteCode;

  event Deployed(address addr, uint256 salt);

  // BYTE CODE
  function setByteCode(bytes memory code) public onlyOwner() {
    byteCode = code;
  }
  // BE CAREFULL THIS WILL RETURN THE ABI ENCODED BYTES ARRAY INSTEAD OF THE BYTES DIRECTLY !!!!!
  // i.e. it will return the byteCode PREFIXED WITH SOME STUFF, the total length of th return will be LONGER than getByteCodeSize()
  function getByteCode() public view returns(bytes memory) {
    return byteCode;
  }
  function getByteCodeSize() public view returns(uint256) {
    return byteCode.length;
  }

  // INIT CODE
  function setInitCode(bytes memory code) public onlyOwner() {
    initCode = code;
  }
  function getInitCode() public view returns(bytes memory) {
    return initCode;
  }
  function getInitCodeSize() public view returns(uint256) {
    return initCode.length;
  }

  function deploy(uint256 salt) public onlyOwner() returns(address) {
    address addr;
    bytes memory bootsrap = initCode;
    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      addr := create2(0, add(bootsrap, 0x20), mload(bootsrap), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
    Initable(addr).init();

    emit Deployed(addr, salt);
    return addr;
  }
}