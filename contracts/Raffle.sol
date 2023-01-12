// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
  uint256 private immutable i_entranceFee;
  address payable[] private s_players;

  VRFCoordinatorV2Interface private immutable i_VRFCoordinatorV2;

  // The gas lane key hash value, which is the maximum gas price you are willing to pay for a request in wei:
  bytes32 private immutable i_gasLane;

  // The subscription ID that this contract uses for funding requests:
  uint64 private immutable i_subscriptionId;

  // The limit for how much gas to use for the callback request to the contract’s fulfillRandomWords() function:
  uint32 private immutable i_callbackGasLimit;

  // How many confirmations the Chainlink node should wait before responding:
  uint16 private constant REQUEST_CONFIRAMATION = 3;

  // How many random values to request:
  uint32 private constant NUM_WORDS = 1;

  event raffleEntered(address indexed player);
  event randomWinnerRequested(uint256 indexed requestId);

  constructor(
    address _VRFCoordinatorV2,
    uint256 _entranceFee,
    bytes32 _gasLane,
    uint64 _subscriptionId,
    uint32 _callbackGasLimit
  ) VRFConsumerBaseV2(_VRFCoordinatorV2) {
    i_entranceFee = _entranceFee;
    i_VRFCoordinatorV2 = VRFCoordinatorV2Interface(_VRFCoordinatorV2);
    i_gasLane = _gasLane;
    i_subscriptionId = _subscriptionId;
    i_callbackGasLimit = _callbackGasLimit;
  }

  function enterRaffle() public payable {
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }
    s_players.push(payable(msg.sender));
    emit raffleEntered(msg.sender);
  }

  function requestRandomWinner() external {
    uint256 requestId = i_VRFCoordinatorV2.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRAMATION,
      i_callbackGasLimit,
      NUM_WORDS
    );

    emit randomWinnerRequested(requestId);
  }

  function fulfillRandomWords(
    uint256 _requestId,
    uint256[] memory _randomWords
  ) internal override {}

  function getEtranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }
}
