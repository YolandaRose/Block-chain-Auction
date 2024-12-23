//快速测试脚本
Eutil = require('ethereumjs-util');
EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function() {
 current_time = Math.round(new Date() / 1000);//定义时间戳
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'QmW3bi4YHRhJWe3WTnJRkAx9Qpa5fkTcKENindiCzACLAN', 'QmVPnc1vJESqsnCsEuL6GndT2VSRQ7oTxSNcwKcJeaxQVY', current_time, current_time + 200, web3.utils.toWei('2','ether'), 0).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'QmSxkP7vSVvMJWqQNjpuhQGTmLuEwnnC2xxbpNajWTCBZh', 'QmZU9sfWXPBqN8dEowhJjTiKRU7A2pkRAHH5GUFssj4MHe', current_time, current_time + 400, web3.utils.toWei('3','ether'), 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 12', 'Cell Phones & Accessories', 'Qmf3aNDtmWwJfyLLX13WHa7wDjb46NWo1utMFAfjrjxexd', 'QmX7VfaTwKRQEGknzDyMwhJJpRWCzd7bDNKokd7tsc8tRU', current_time, current_time + 14, web3.utils.toWei('1','ether'), 0).then(function(f) {console.log(f)})}); 
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Usagi doll', 'Toys & Hobbies', 'Qmd7sYfBFjaLt2zMTAgAN7THMhTTuVQ8vcqV9KdwrtdD2A', 'QmUWUWo69j8umLaKmQ278rmUiDreKzTzoLGMwBaXhbaA1R', current_time, current_time + 86400, web3.utils.toWei('4','ether'), 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('chiikawa doll', 'Toys & Hobbies', 'QmW2rsv3mG2aYvtBF8pQiMfxqVTi88rJCc9XUU2phVRvp7', 'QmUWUWo69j8umLaKmQ278rmUiDreKzTzoLGMwBaXhbaA1R', current_time, current_time + 86400, web3.utils.toWei('2','ether'), 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Jeans', 'Clothing, Shoes & Accessories', 'QmazhPWL7eECZv6wo3g1y7kSDezxnPt61NmsiR4WyoKJR5', 'QmVSzr5fim6NRn8R4tE8VsXx3mahrzVqiNRof8NEY89YiX', current_time, current_time + 86400, web3.utils.toWei('5','ether'), 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.productIndex.call().then(function(f){console.log(f)})});
}