// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import {MerkleTree} from "merkletreejs";
import keccak256 from "keccak256";
import whitelist from "./whitelist.json" assert { type: "json" };

console.log(keccak256('yes').toString('hex'));
export function root(account){
    console.log(account);
    console.log(keccak256(account).toString('hex'));
    let accounts = [];
    whitelist.map(acc => {
    accounts.push(acc.address);
    });
    const leaves = accounts.map(address => keccak256(address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    return keccak256(account).toString('hex');
}