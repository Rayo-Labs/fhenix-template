// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@fhenixprotocol/contracts/FHE.sol";

interface IFhenixWEERC20 {
  function transferEncrypted(
    address recipient,
    inEuint64 calldata encryptedAmount
  ) external;

  function transferFromEncrypted(
    address sender,
    address recipient,
    inEuint64 calldata encryptedAmount
  ) external;
}

contract FhenixBridge is Ownable2Step {
  IFhenixWEERC20 public weerc20;
  mapping(address => bool) public relayers;

  event Packet(
    inEaddress encryptedTo,
    inEuint64 encryptedAmount,
    address relayerAddress
  );

  error OnlyRelayer();

  modifier onlyRelayer() {
    if (!relayers[msg.sender]) {
      revert OnlyRelayer();
    }
    _;
  }

  constructor(address _tokenAddress) Ownable(msg.sender) {
    weerc20 = IFhenixWEERC20(_tokenAddress);
  }

  function setRelayer(address _relayer, bool _status) public onlyOwner {
    relayers[_relayer] = _status;
  }

  function bridgeWEERC20(
    inEaddress calldata _encryptedTo,
    inEuint64 calldata _encryptedAmount,
    address _relayerAddress
  ) public {
    weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount);

    emit Packet(_encryptedTo, _encryptedAmount, _relayerAddress);
  }

  function withdraw(inEuint64 calldata _encryptedAmount) public onlyOwner {
    weerc20.transferEncrypted(msg.sender, _encryptedAmount);
  }
}
