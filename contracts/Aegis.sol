// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Aegis is ERC20Capped, ERC20Burnable{
    address payable public owner;
    uint256 public reward;

    //mapping of allowed organizations
    mapping(address => bool) allowedOrganizations;

    //event when app user is rewarded
    event UserRewarded(address indexed _appUser, uint256 _reward);

    //creating the Aegis token with the initial supply and cap on maximum supply
    constructor(uint256 cap, uint256 _reward) ERC20("Aegis","AEG") ERC20Capped(cap*(10**decimals())){
        owner = payable(msg.sender);
        _mint(owner,700000*(10**decimals()));
        reward = _reward;
    }

    //minting the user reward from the authorized organization public address
    function mintReward(address appUser) public onlyAllowedOrganizations{
        require(appUser != address(0),"Invalid user address.");
        _mint(appUser,reward);
        emit UserRewarded(appUser, reward);
    }

    //overriding _update() -> required by Solidity
    function _update(address from, address to, uint256 value) internal override(ERC20Capped,ERC20){
        super._update(from, to, value);
    }

    function setReward(uint256 _reward) public onlyOwner{
        reward = _reward*(10**decimals());
    }

    //add new organization -> with owners permission
    function addOrganization(address newOrganization) public onlyOwner{
        allowedOrganizations[newOrganization] = true;
    }

    //redeem the Aegis tokens -> send them to owner and burn them
    function redeemTokens() public onlyAllowedOrganizations{
        transfer(owner,reward);
        _burn(owner,reward);
    }

    //modifiers to control authorization
    modifier onlyOwner(){
        require(msg.sender == owner,"Only owner can use this function.");
        _;
    }

    modifier onlyAllowedOrganizations(){
        require(allowedOrganizations[msg.sender] == true,"Only allowed organizations can transfer Aegis tokens.");
        _;
    }
}
