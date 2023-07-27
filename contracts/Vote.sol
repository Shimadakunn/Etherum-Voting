// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract Vote is Ownable{
    using Counters for Counters.Counter;
    bytes32 public merkleRoot;

    //Candidates Variables
    Counters.Counter public _candidateId;
    struct Candidate {
        uint id;
        string name;
        uint votes;
    }
    address[] public candidateArray;
    mapping (address => Candidate) public Candidates;

    //Voters Variables
    mapping(address => bool) public Voters;

    //Events
    event voterVotedTo(
        address voter,
        address candidate
    );
    event candidateCreated(
        uint id,
        string name
    );
    constructor(bytes32 _merkleRoot){
        merkleRoot = _merkleRoot;
    }

    function createCandidate(address _address, string memory _name) external onlyOwner() {
        candidateArray.push(_address);
        Candidate memory candidate = Candidate(_candidateId.current(),_name,0);
        Candidates[_address] = candidate;
        emit candidateCreated(_candidateId.current(), _name);
        _candidateId.increment();
        console.log("Candidate created");
    }

    function getCandidatesData() external onlyOwner() view returns(address[] memory,string[] memory,string[] memory){
        address[] memory addresses = new address[](_candidateId.current());
        string[] memory names = new string[](_candidateId.current());
        string[] memory result = new string[](_candidateId.current());
        for(uint i = 0; i < _candidateId.current(); i++){
            addresses[i] = candidateArray[i];
            names[i] = Candidates[candidateArray[i]].name;
            result[i] = Strings.toString(Candidates[candidateArray[i]].votes);
        }
        return (addresses,names,result);
    }

    function vote(address _address,bool _proof) external {
        require(_proof, "Not on the whitelist");
        require(!Voters[msg.sender], "you have already voted");
        Voters[msg.sender] = true;
        Candidates[_address].votes ++;
        emit voterVotedTo(msg.sender,_address);
    }
}