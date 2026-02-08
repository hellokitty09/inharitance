import { buildPoseidon } from "circomlibjs";
import { keccak256, toUtf8Bytes } from "ethers";
const poseidon = await buildPoseidon();
function strtonum(name){
    const h=keccak256(toUtf8Bytes(name))
     return BigInt(h) % poseidon.F.p;
}
function poseidonInt(x) {
  let res = 0n;
  for (const byte of x) {
    res = (res << 8n) + BigInt(byte);
  }
  return res;
}

function dualhash(a,b) {
  return (poseidon([a,b]));
}
function hash4(a,b,c,d) {
  return (poseidon([a,b,c,d]));
}

function regionhash(region){
      return poseidon([(strtonum(region))]);

}

function build(leaves){
    let layers=[leaves];
    while(layers[layers.length-1].length>1){
        const prev=layers[layers.length-1];
        const next=[];
        for(let i=0;i<prev.length;i+=2){
            const left=prev[i];
            let right=prev[i];
            
            if(i!=prev.length-1){
              right=prev[i+1];
            }
            next.push(dualhash(left,right));
            
        }
        layers.push(next);
    }
    return layers
}
function PathTraversal(index,layers){
   const elements=[];
   const ids=[];
   for(let i=0;i<layers.length-1;i++){
      const layer=layers[i];
      const r=index%2;
      const guy=layer[index];
      let partner=layer[index];
      if(r==0){
         partner=layer[index+1];
      }
      else{
         partner=layer[index-1];
      }
      elements.push(partner);
      ids.push(r);
      index=Math.floor(index/2);
   }
    return { elements, ids };

}
const h1=strtonum("Dhiraj");
const h2=strtonum("Andheri");
const h3=strtonum("Bandra");
const D=dualhash(h1,h2);
const A=dualhash(h2,h1);
const M=dualhash(h3,h1);
const R=dualhash(h1,h3);
const leaves = [D, A, M, ];
const layers = build(leaves);
const root = layers[layers.length - 1][0];
console.log("Root as bigint:", poseidonInt(root));
console.log("D :", poseidonInt(D));
console.log("A :", poseidonInt(A));
console.log("M :", poseidonInt(M));
console.log("R :", poseidonInt(R));
console.log(PathTraversal(0,layers))
// function Whistleblower(name,region,acc,pass,pathEle,pathIndex,Root,depth) {

//     let h =hash4(name,region,acc,pass);

//     mt = MerkleProof(depth);
//     mt.leaf = leaf;
//     mt.root = merkleRoot;
//     for (var i = 0; i < depth; i++) {
//         mt.pathElements[i] = pathElements[i];
//         mt.pathIndex[i] =pathIndex[i];
//     }

// }