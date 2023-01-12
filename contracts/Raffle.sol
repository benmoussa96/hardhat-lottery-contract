// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle {
  uint256 private immutable i_entranceFee;
  address payable[] private s_players;

  event raffleEnter(address indexed player);

  constructor(uint256 _entranceFee) {
    i_entranceFee = _entranceFee;
  }

  function enterRaffle() public payable {
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }
    s_players.push(payable(msg.sender));
    emit raffleEnter(msg.sender);
  }

  //   function requestRandomWinner() external {}

  //   function fulfillRandomWords () internal override {}

  function getEtranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }
}
