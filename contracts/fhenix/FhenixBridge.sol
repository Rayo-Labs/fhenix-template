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

  struct Intent {
    address from;
    address to;
    euint64 amount;
  }

  uint64 public nextIntentId = 0;

  mapping(uint64 => Intent) public intents;

  event Packet(
    eaddress encryptedTo,
    euint64 encryptedAmount,
    string toPermit,
    string amountPermit,
    address relayerAddress
  );
  event IntentProcesses(
    address indexed from,
    address indexed to,
    euint64 amount
  );

  constructor(address _tokenAddress) Ownable(msg.sender) {
    weerc20 = IFhenixWEERC20(_tokenAddress);
  }

  function bridgeWEERC20(
    inEaddress calldata _encryptedTo,
    inEuint64 calldata _encryptedAmount,
    address _relayerAddress,
    bytes32 _relayerSeal
  ) public {
    weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount);

    eaddress to = FHE.asEaddress(_encryptedTo);
    euint64 amount = FHE.asEuint64(_encryptedAmount);

    string memory toPermit = FHE.sealoutput(to, _relayerSeal);
    string memory amountPermit = FHE.sealoutput(amount, _relayerSeal);

    emit Packet(to, amount, toPermit, amountPermit, _relayerAddress);
  }

  function onRecvIntent(
    address _to,
    inEuint64 calldata _encryptedAmount
  ) public {
    weerc20.transferFromEncrypted(msg.sender, _to, _encryptedAmount);

    euint64 amount = FHE.asEuint64(_encryptedAmount);

    nextIntentId++;
    Intent memory intent = Intent({from: msg.sender, to: _to, amount: amount});
    intents[nextIntentId] = intent;

    emit IntentProcesses(msg.sender, _to, amount);
  }

  function withdraw(inEuint64 calldata _encryptedAmount) public onlyOwner {
    weerc20.transferEncrypted(msg.sender, _encryptedAmount);
  }
}
