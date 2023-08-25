//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "hardhat/console.sol";

contract MyTest {
    uint256 public unlockTime;
    address payable public owner;

    event Withdrawal(uint256 amount, uint256 when);

    constructor(uint256 _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Contract must be set to unlock in future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(
            block.timestamp >= unlockTime,
            "This action is not yet available"
        );
        require(
            msg.sender == owner,
            "This action can only be carried out by the owner"
        );

        emit Withdrawal(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);
    }
}
