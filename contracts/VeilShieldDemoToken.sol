// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VeilShieldDemoToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 100_000;

    constructor(address initialHolder) ERC20("VeilShield Demo USD", "vUSD") {
        _mint(initialHolder, 1_000_000);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
