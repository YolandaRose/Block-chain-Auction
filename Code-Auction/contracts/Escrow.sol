// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
contract Escrow {
	uint public productId;
	address public buyer;// 买家
	address public seller;// 卖家
	address public arbiter;// 托管人
	uint public amount;//竞拍金额
	
	bool public fundsDisbursed;// 是否释放资金
	
	mapping (address => bool) releaseAmount;// 释放给卖家
	uint public releaseCount;//多少人同意释放
	
	mapping (address => bool) refundAmount;// 回退给买家
	uint public refundCount;//多少人同意回退

	event CreateEscrow(uint _productId, address _buyer, address _seller, address _arbiter);
	event UnlockAmount(uint _productId, string _operation, address _operator);
	event DisburseAmount(uint _productId, uint _amount, address _beneficiary);

	constructor(uint _productId, address _buyer, address _seller, address _arbiter) payable {
		productId = _productId;
		buyer = _buyer;
		seller = _seller;
		arbiter = _arbiter;
		amount = msg.value;
		fundsDisbursed = false;
		emit CreateEscrow(_productId, _buyer, _seller, _arbiter);
	}

	function escrowInfo() view public returns (address, address, address, bool, uint, uint) {
		return (buyer, seller, arbiter, fundsDisbursed, releaseCount, refundCount);
	}

	//释放资金给卖家
	function releaseAmountToSeller(address caller) public {
		require(!fundsDisbursed);//判断是否已经释放资金
		require(caller == buyer || caller == seller || caller == arbiter);
		if ( !releaseAmount[caller] ) {//判断是否已经同意释放资金,防止多次同意
			releaseAmount[caller] = true;
			releaseCount += 1;
			emit UnlockAmount(productId, "release", caller);
		}
		if (releaseCount == 2) {//判断同意人数达到2/3
			payable(seller).transfer(amount);//转给卖家
			fundsDisbursed = true;//修改状态
			emit DisburseAmount(productId, amount, seller);
		}
	}

	//退还资金给买家  
	function refundAmountToBuyer(address caller) public {
		require(!fundsDisbursed);
		require(caller == buyer || caller == seller || caller == arbiter);
		if (!refundAmount[caller]) {
			refundAmount[caller] = true;
			refundCount += 1;
			emit UnlockAmount(productId, "refund", caller);
		}
		if (refundCount == 2) {
			payable(buyer).transfer(amount);
			fundsDisbursed = true;
			emit DisburseAmount(productId, amount, buyer);
		}
	}
}