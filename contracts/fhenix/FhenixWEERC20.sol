// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FhenixWEERC20 is ERC20 {
  uint8 public constant encDecimals = 6;

  mapping(address => euint64) internal _encBalances;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _mint(msg.sender, 100 * 10 ** uint(decimals()));
  }

  function getEncryptedBalance(address account) public view returns (euint64) {
    return _encBalances[account];
  }

  function wrap(uint256 amount) public {
    // Make sure that the sender has enough of the public balance
    require(balanceOf(msg.sender) >= amount);
    // Burn public balance
    _burn(msg.sender, amount);
    uint64 convertedAmount = _convertDecimalForDeposit(amount);
    // convert public amount to shielded by encrypting it
    euint64 shieldedAmount = FHE.asEuint64(convertedAmount);
    // Add shielded balance to his current balance
    _encBalances[msg.sender] = _encBalances[msg.sender] + shieldedAmount;
  }

  function unwrap(inEuint64 memory amount) public {
    euint64 _amount = FHE.asEuint64(amount);
    // verify that our shielded balance is greater or equal than the requested amount
    FHE.req(_encBalances[msg.sender].gte(_amount));
    // // subtract amount from shielded balance
    _encBalances[msg.sender] = _encBalances[msg.sender] - _amount;
    uint64 decryptedAmount = FHE.decrypt(_amount);
    uint256 convertedAmount = _convertDecimalForWithdraw(decryptedAmount);
    // // add amount to caller's public balance by calling the `mint` function
    _mint(msg.sender, convertedAmount);
  }

  function transferEncrypted(
    address to,
    inEuint64 calldata encryptedAmount
  ) public {
    euint64 amount = FHE.asEuint64(encryptedAmount);
    // Make sure the sender has enough tokens.
    FHE.req(amount.lte(_encBalances[msg.sender]));
    // Add to the balance of `to` and subract from the balance of `from`.
    _encBalances[to] = _encBalances[to] + amount;
    _encBalances[msg.sender] = _encBalances[msg.sender] - amount;
  }

  // Converts the amount for deposit.
  function _convertDecimalForDeposit(
    uint256 amount
  ) internal view returns (uint64) {
    return uint64(amount / 10 ** (decimals() - encDecimals));
  }

  // Converts the amount for withdrawal.
  function _convertDecimalForWithdraw(
    uint64 amount
  ) internal view returns (uint256) {
    return uint256(amount) * 10 ** (decimals() - encDecimals);
  }
}
