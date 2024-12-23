// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../contracts/Escrow.sol";

contract EcommerceStore {
    enum ProductStatus{ Open, Sold, Unsold}//商品状态：可竞拍，已卖出，未卖出
    enum ProductCondition{ New, Used}//商品状况：全新，二手

    uint public productIndex;//商品计数器
    mapping(address => mapping(uint256 => Product)) stores;//创建者关联他发布的所有商品
    mapping(uint256 => address) productIdInStore;//商品关联创建者
    mapping(uint256 => address) productEscrow;//商品关联Escrow合约地址

    //商品数据结构
    struct Product{
        uint id;//商品唯一编号
        string name;//商品名称
        string category;//商品类别
        string imageLink;//商品图片
        string descLink;//商品描述文本
        uint auctionStartTime;//开始拍卖时间
        uint auctionEndTime;//结束拍卖时间
        uint startPrice;//起拍价
        address highestBidder;//最高出价者
        uint highestBid;//最高价
        uint secondHighestBid;//次高价
        uint totalBids;//总竞拍人数
        ProductStatus status;
        ProductCondition condition;
        mapping (address => mapping(bytes32 => Bid)) bids;//用存储的出价hash值来mapping到出价者
    }

    //出价信息结构
    struct Bid{
        address bidder;//出价人
        uint productId;//商品
        uint value;//出价人支付金额
        bool revealed;//是否揭示报价
    }

    // 添加商品事件
    event NewProduct(
        uint256 _productId,
        string _name,
        string _category,
        string _imageLink,
        string _descLink,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _startPrice,
        uint256 _productCondition
    );
    
    // 商品初始下标
    function store(uint256 index_) public {
        productIndex = index_;
    }

    //添加商品
    function addProductToStore(
        string memory _name,
        string memory _category,
        string memory _imageLink,
        string memory _descLink,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        string memory _startPrice,
        uint256 _productCondition
    ) public {
        require(_auctionStartTime < _auctionEndTime);
        productIndex += 1;
        // 添加商品在以msg.sender为索引的商店里
        Product storage product = stores[msg.sender][productIndex];
        product.id = productIndex;
        product.name = _name;
        product.category = _category;
        product.imageLink = _imageLink;
        product.descLink = _descLink;
        product.auctionStartTime = _auctionStartTime;
        product.auctionEndTime = _auctionEndTime;
        product.startPrice = stringToUint(_startPrice);
        product.status = ProductStatus.Open;
        product.condition = ProductCondition(_productCondition);
        // 商品ID对应的商店
        productIdInStore[productIndex] = msg.sender;
		emit NewProduct(productIndex, _name, _category, _imageLink, _descLink, _auctionStartTime, _auctionEndTime, stringToUint(_startPrice), _productCondition);
    }


    // 获取商品信息
    function getProduct(uint256 _productId) public view returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            ProductStatus,
            ProductCondition
    ){
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        return (
            product.id,
            product.name,
            product.category,
            product.imageLink,
            product.descLink,
            product.auctionStartTime,
            product.auctionEndTime,
            product.startPrice,
            product.status,
            product.condition
        );
    }

    //获取商品数量
    function getProductCount() public view returns (uint) {
    return productIndex;
    }

    // 出价
    function bid(uint256 _productId, bytes32 _bid)public payable returns(bool){
        Product storage product = stores[productIdInStore[_productId]][_productId];
        require(block.timestamp >= product.auctionStartTime);//当前出价时间不早于开始拍卖时间
        require(block.timestamp <= product.auctionEndTime);//当前出价时间不晚于结束拍卖时间
        require(msg.value >= product.startPrice, "=");//出价要大于起拍价
        require(product.bids[msg.sender][_bid].bidder ==0x0000000000000000000000000000000000000000,"==");//出价者不能重复出价
        product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
        product.totalBids += 1;//竞拍人数加1
        return true;
    }

    // 揭示出价
    function revealBid(
        uint256 _productId,
        string memory _amount,
        string memory _secret
    ) public {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        require(block.timestamp > product.auctionStartTime);//揭示时间大于结束拍卖时间
        // 进行加密后的出价的keccak256哈希值
        bytes32 sealedBid = keccak256(abi.encode(_amount, _secret));//hash

        Bid memory bidInfo = product.bids[msg.sender][sealedBid];//得到出价者信息
        require(bidInfo.bidder > 0x0000000000000000000000000000000000000000);//出价人存在
        require(bidInfo.revealed == false);//出价还未揭示

        uint256 refund;// 需要回退的金额
        uint256 amount = stringToUint(_amount);//出价数量，转换_amount类型方便计算

        uint256 bidInfov = bidInfo.value;
        if (bidInfov < amount) {//提交价小于起拍价无效出价
            refund = bidInfov;//返回提交金额（不是出价）
        } else {
            // 第一次出价的人
            if (address(product.highestBidder) ==0x0000000000000000000000000000000000000000) {
                product.highestBidder = msg.sender;
                product.highestBid = amount;
                product.secondHighestBid = product.startPrice;//起拍价成为第二高价
                refund = bidInfov - amount;//退还金额
            } else {//非第一次竞价
                // 出价大于最高价
                if (amount > product.highestBid) {
                    product.secondHighestBid = product.highestBid;//最高价成为第二高
                    payable(product.highestBidder).transfer(product.highestBid);//退还第二高金额
                    product.highestBidder = msg.sender;
                    product.highestBid = amount;
                    refund = bidInfov - amount;
                } else if (amount > product.secondHighestBid) {// 出价大于第二高价
                    product.secondHighestBid = amount;
                    refund = amount;
                } else {// 有效出价，但出局
                    refund = amount;//全部退还
                }
            }
        }
        
        product.bids[msg.sender][sealedBid].revealed = true;//修改揭示出价状态为true

        if (refund > 0) {
            payable(msg.sender).transfer(refund);//退还ETH
        }
    }

    // 查询最高出价人信息
    function highestBidderInfo(uint256 _productId)public view returns(address, uint, uint){
        Product storage product = stores[productIdInStore[_productId]][_productId];
        return (product.highestBidder, product.highestBid, product.secondHighestBid);
    }

    //查询竞价人数
    function totalBids(uint256 _productId) public view returns (uint256) {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        return product.totalBids;
    }

    // 字符串转为整数
    function stringToUint(string memory s) private pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {//ASCII码在数字范围内
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return result;
    }

    //结束拍卖，宣布赢家
    function finalizeAuction(uint256 _productId) public {
        Product storage product = stores[productIdInStore[_productId]][ _productId];
        // 48 hours to reveal the bid
        require(block.timestamp > product.auctionEndTime);//结束拍卖时间大于当前时间
        require(product.status == ProductStatus.Open);//商品状态为可竞拍
        require(product.highestBidder != msg.sender);//当前出价人不是最高出价人
        require(productIdInStore[_productId] != msg.sender);//当前出价人不是商品创建者

        if (product.highestBidder == 0x0000000000000000000000000000000000000000) {//没有人出价
            product.status = ProductStatus.Unsold;
        } else {
            // Whoever finalizes the auction is the arbiter
            Escrow escrow = (new Escrow){value: product.secondHighestBid}(
                _productId,
                product.highestBidder,
                productIdInStore[_productId],
                msg.sender
            );
            productEscrow[_productId] = address(escrow);
            product.status = ProductStatus.Sold;
            // 赢家只需要付第二高竞价者的金额            
            uint256 refund = product.highestBid - product.secondHighestBid;
            payable(product.highestBidder).transfer(refund);
        }
    }

    //查询 escrow 合约地址
    function escrowAddressForProduct(uint256 _productId)public view returns (address) {
        return productEscrow[_productId];
    }

    // 查询 escrow 合约信息
    function escrowInfo(uint256 _productId)public view returns (
            address,
            address,
            address,
            bool,
            uint256,
            uint256
        ){
        return Escrow(productEscrow[_productId]).escrowInfo();
    }

    // 释放给卖家
    function releaseAmountToSeller(uint256 _productId) public {
        Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
    }

    // 退回给买家
    function refundAmountToBuyer(uint256 _productId) public {
        Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }

    // 生成密钥
    function keccak(string memory _amount, string memory _secret) public pure returns (bytes32){   
        return keccak256(abi.encodePacked(_amount, _secret));
    }
}
