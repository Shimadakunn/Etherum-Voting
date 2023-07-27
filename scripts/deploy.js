// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";
import {MerkleTree} from "merkletreejs";
import { sha256 } from 'js-sha256';
import whitelist from "./whitelist.json" assert { type: "json" };

let accounts = [];
whitelist.map(acc => {
  accounts.push(acc.address);
});
const leaves = accounts.map(address => sha256(address));
const tree = new MerkleTree(leaves, sha256, { sort: true });
const root = tree.getHexRoot();
console.log(root);

const Vote = await ethers.deployContract("Vote", [root]);

await Vote.waitForDeployment();

console.log(
  `Vote deployed to ${Vote.target}`
);
