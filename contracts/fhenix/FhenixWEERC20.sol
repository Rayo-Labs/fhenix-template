// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FhenixWEERC20 is ERC20 {
  mapping(eaddress => euint32) public encBalances;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _mint(msg.sender, 100 * 10 ** uint(decimals()));
  }

  function wrap(uint256 amount) public {
    // Make sure that the sender has enough of the public balance
    require(balanceOf(msg.sender) >= amount, "Not enough balance");

    eaddress sender = FHE.asEaddress(msg.sender);

    // Burn public balance
    _burn(msg.sender, amount);

    uint32 convertedAmount = _convertDecimalForDeposit(amount);

    // convert public amount to shielded by encrypting it
    euint32 shieldedAmount = FHE.asEuint32(convertedAmount);
    // Add shielded balance to his current balance
    encBalances[sender] = encBalances[sender] + shieldedAmount;
  }

  function unwrap(inEuint32 memory amount) public {
    eaddress sender = FHE.asEaddress(msg.sender);
    euint32 _amount = FHE.asEuint32(amount);

    // verify that our shielded balance is greater or equal than the requested amount
    FHE.req(encBalances[sender].gte(_amount));
    // subtract amount from shielded balance
    encBalances[sender] = encBalances[sender] - _amount;

    uint32 unConvertedAmount = FHE.decrypt(_amount);
    uint256 convertedAmount = _convertDecimalForWithdraw(unConvertedAmount);
    // add amount to caller's public balance by calling the `mint` function
    _mint(msg.sender, convertedAmount);
  }

  function transferEncrypted(
    inEaddress calldata encryptedTo,
    inEuint32 calldata encryptedAmount
  ) public {
    eaddress sender = FHE.asEaddress(msg.sender);
    eaddress to = FHE.asEaddress(encryptedTo);
    euint32 amount = FHE.asEuint32(encryptedAmount);
    // Make sure the sender has enough tokens.
    FHE.req(amount.lte(encBalances[sender]));

    // Add to the balance of `to` and subract from the balance of `from`.
    encBalances[to] = encBalances[to] + amount;
    encBalances[sender] = encBalances[sender] - amount;
  }

  // Converts the amount for deposit.
  function _convertDecimalForDeposit(
    uint256 amount
  ) internal view returns (uint32) {
    return uint32(amount / 10 ** (18 - decimals()));
  }

  // Converts the amount for withdrawal.
  function _convertDecimalForWithdraw(
    uint32 amount
  ) internal view returns (uint256) {
    return uint256(amount) * 10 ** (18 - decimals());
  }
}
