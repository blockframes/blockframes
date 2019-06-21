
pragma solidity ^0.5.9;

contract Initable {
  bool public isInit;

  modifier requireInit() {
    require(isInit == true, 'This contract has not been initialized');
    _;
  }
  modifier requireNotInit() {
    require(isInit == false, 'This contract has already been initialized');
    _;
  }

  function init() public requireNotInit() {
    isInit = true;
  }
}