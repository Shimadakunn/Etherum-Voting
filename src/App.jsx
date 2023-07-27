import React from 'react';
import { useState,useEffect } from 'react';
import {ethers} from 'ethers';
import Vote from './artifacts/contracts/Vote.sol/Vote.json';
import {MerkleTree} from "merkletreejs";
import whitelist from "./whitelist.json";
import { sha256 } from 'js-sha256';
import './App.css';

let contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"

function App() {
  const [addresses, setAddresses] = useState([]);
  const [names, setNames] = useState([]);
  const [votes, setVotes] = useState([]);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [owner, setOwner] = useState(false);
  const [result, setResult] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState();

  useEffect(() => {
    getCandidates();
    isOwner();
    setError('');
  }, []);
  async function isOwner(){
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, Vote.abi, provider);
      try {
        const result = await contract.owner();
        if(result.toLowerCase() === accounts[0].toLowerCase()){setOwner(true);}
      } catch (err) {
        console.log("Erreur lors du owner");
      }
    }
  }
  async function getCandidates() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, Vote.abi, provider);
      try {
        const result = await contract.getCandidatesData();
        setAddresses(result[0]);
        setNames(result[1]);
        setVotes(result[2]);
        console.log(result[2]);
      } catch (err) {
        console.log("Erreur lors de la récupération des datas");
      }
    }
  }
  async function createCandidate() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Vote.abi, signer);
      try {
        const transaction = await contract.createCandidate(address,name);
        await transaction.wait();
        await getCandidates();
        console.log("Candidat créé");
      } catch (err) {
        console.log("Err candidate creation");
      }
    }
  }
  async function vote(address) {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Vote.abi, signer);
      let wl = [];
      whitelist.map(acc => {
        wl.push(acc.address.toLowerCase());
      });
      const leaves = wl.map(address => sha256(address));
      const tree = new MerkleTree(leaves, sha256, { sort: true });
      const root = tree.getRoot().toString('hex');
      const leaf = sha256(accounts[0]);
      const proof = tree.getHexProof(leaf);
      const verified = tree.verify(proof, leaf, root);
      console.log(proof);
      try {
        const transaction = await contract.vote(address,verified);
        await transaction.wait();
        await getCandidates();
        console.log("Vote effectué");
      } catch (err) {
        setError("You can't vote twice");
        console.log("You can't vote twice");
      }
    }
  }
  async function getResults() {
    setResult(true);
    const maxIndex = votes.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    setWinnerIndex(maxIndex);
  }
  async function changeAddress(e) {
    setAddress(e.target.value);
  }
  async function changeName(e) {
    setName(e.target.value);
  }
  return (
    <div className="App">
      <div className="logo">
        <i className="fa-brands fa-ethereum"></i>
      </div>
      {error && <h2 className="error">{error}</h2>}
      <div className="candidate_flex">
        {!result && addresses.map((address, index) => (
          <div className="candidate_container" key={index}>
            <div className="name">{names[index]}</div>
            <div className="card_container">
              <img className="card" src={`./src/img/${index}.png`}/>
            </div>
            <div className="votes">Votes : {votes[index]}</div>
            <div className="vote_button_container">
              <button className="vote" onClick={() => vote(addresses[index])}>Vote</button>
            </div>
          </div>
        ))}
        {result && addresses.map((address, index) => {
          if(index === winnerIndex){
            return <div className="candidate_container">
              <div className="name">Winner is: {names[index]}</div>
              <div className="card_container">
                <img className="card" src={`./src/img/${index}.png`}/>
              </div>
              <div className="votes">Votes : {votes[index]}</div>
            </div>
          }
        })}
      </div>
      {owner && 
        <div className="creation">
          <input type = "text" className="address_input"placeholder="Address" onChange={changeAddress}/>
          <input type = "text" className="name_input" placeholder="Name" onChange={changeName}/>
          <button className="create" onClick={createCandidate}>Create</button>
          <button className="result" onClick={getResults}>Results</button>
        </div>}
    </div>
  )
}

export default App;