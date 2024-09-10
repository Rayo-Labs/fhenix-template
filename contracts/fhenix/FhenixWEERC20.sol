// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FhenixWEERC20 is ERC20, Permissioned {
  uint8 public constant encDecimals = 6;

  mapping(address => euint64) internal _encBalances;
  mapping(address => mapping(address => euint64)) internal _allowances;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _mint(msg.sender, 100 * 10 ** uint(decimals()));
  }

  function getBalanceEncrypted(
    Permission calldata perm
  ) public view onlySender(perm) returns (uint256) {
    return FHE.decrypt(_encBalances[msg.sender]);
  }

  function wrap(uint256 amount) public {
    require(balanceOf(msg.sender) >= amount);

    _burn(msg.sender, amount);

    uint64 convertedAmount = _convertDecimalForDeposit(amount);
    euint64 shieldedAmount = FHE.asEuint64(convertedAmount);

    _encBalances[msg.sender] = _encBalances[msg.sender] + shieldedAmount;
  }

  function unwrap(inEuint64 memory amount) public {
    euint64 _amount = FHE.asEuint64(amount);

    FHE.req(_encBalances[msg.sender].gte(_amount));

    _encBalances[msg.sender] = _encBalances[msg.sender] - _amount;

    uint64 decryptedAmount = FHE.decrypt(_amount);
    uint256 convertedAmount = _convertDecimalForWithdraw(decryptedAmount);

    _mint(msg.sender, convertedAmount);
  }




  function approve(address spender, inEuint64 calldata encryptedAmount) public {
    euint64 amount = FHE.asEuint64(encryptedAmount);
    _allowances[msg.sender][spender] = amount;
  }

  function transferEncrypted(
    address to,
    inEuint64 calldata encryptedAmount
  ) public {

    euint64 amount = FHE.asEuint64(encryptedAmount);
    ebool canTransfer = FHE.lte(amount, _encBalances[msg.sender]);
    euint64 canTransferAmount = FHE.select(canTransfer, amount, FHE.asEuint64(0));
    _transferEncrypted(msg.sender, to, canTransferAmount, canTransfer);
    
  }


  function transferFromEncrypted(address from, address to, inEuint64 calldata encryptedAmount) public {
    euint64 amount = FHE.asEuint64(encryptedAmount);

    ebool canTransfer = FHE.and(
        FHE.lte(amount, _encBalances[from]),  
        FHE.lte(amount, _allowances[from][msg.sender])  
    );

    euint64 transferAmount = FHE.select(canTransfer, amount, FHE.asEuint64(0));

    ebool isTransferable = _updateAllowance(from, msg.sender, transferAmount);

    _transferEncrypted(from, to, transferAmount, isTransferable);
}





   function _updateAllowance(address owner, address spender, euint64 amount) internal returns (ebool) {
    euint64 currentAllowance = _allowances[owner][spender];

    ebool allowedTransfer = FHE.and(
        FHE.lte(amount, currentAllowance),  
        FHE.lte(amount, _encBalances[owner])  
    );

    _allowances[owner][spender] = FHE.select(allowedTransfer, FHE.sub(currentAllowance, amount), currentAllowance);

    return allowedTransfer;
}



  function _transferEncrypted(address from, address to, euint64 amount, ebool isTransferable) internal {
        euint64 transferValue = FHE.select(isTransferable, amount, FHE.asEuint64(0));
        euint64 newBalanceTo = FHE.add(_encBalances[to], transferValue);
        _encBalances[to] = newBalanceTo;
  

        euint64 newBalanceFrom = FHE.sub(_encBalances[from], transferValue);
        _encBalances[from] = newBalanceFrom;
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
