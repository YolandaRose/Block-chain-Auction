package com.ruoyi.system.domain;

import java.math.BigInteger;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 区块链拍卖对象 blockchain_auction
 * 
 * @author ruoyi
 */
public class BlockchainAuction extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 拍卖ID */
    private Long id;

    /** 商品名称 */
    @Excel(name = "商品名称")
    private String name;

    /** 商品类别 */
    @Excel(name = "商品类别")
    private String category;

    /** 商品图片链接 */
    @Excel(name = "商品图片链接")
    private String imageLink;

    /** 商品描述 */
    @Excel(name = "商品描述")
    private String descLink;

    /** 拍卖开始时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "拍卖开始时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Long auctionStartTime;

    /** 拍卖结束时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "拍卖结束时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Long auctionEndTime;

    /** 起拍价(Wei) */
    @Excel(name = "起拍价(Wei)")
    private String startPrice;

    /** 最高出价(Wei) */
    @Excel(name = "最高出价(Wei)")
    private String highestBid;

    /** 次高出价(Wei) */
    @Excel(name = "次高出价(Wei)")
    private String secondHighestBid;

    /** 出价次数 */
    @Excel(name = "出价次数")
    private Integer totalBids;

    /** 状态（0进行中 1已售出 2流拍） */
    @Excel(name = "状态", readConverterExp = "0=进行中,1=已售出,2=流拍")
    private Integer status;

    /** 商品状况（0全新 1二手） */
    @Excel(name = "商品状况", readConverterExp = "0=全新,1=二手")
    private Integer itemCondition;

    /** 卖家地址 */
    @Excel(name = "卖家地址")
    private String seller;

    /** 最高出价者地址 */
    @Excel(name = "最高出价者地址")
    private String highestBidder;

    /** 区块链交易哈希 */
    @Excel(name = "区块链交易哈希")
    private String transactionHash;

    /** 区块高度 */
    @Excel(name = "区块高度")
    private Long blockNumber;

    public void setId(Long id) 
    {
        this.id = id;
    }

    public Long getId() 
    {
        return id;
    }

    public void setName(String name) 
    {
        this.name = name;
    }

    public String getName() 
    {
        return name;
    }

    public void setCategory(String category) 
    {
        this.category = category;
    }

    public String getCategory() 
    {
        return category;
    }

    public void setImageLink(String imageLink) 
    {
        this.imageLink = imageLink;
    }

    public String getImageLink() 
    {
        return imageLink;
    }

    public void setDescLink(String descLink) 
    {
        this.descLink = descLink;
    }

    public String getDescLink() 
    {
        return descLink;
    }

    public void setAuctionStartTime(Long auctionStartTime) 
    {
        this.auctionStartTime = auctionStartTime;
    }

    public Long getAuctionStartTime() 
    {
        return auctionStartTime;
    }

    public void setAuctionEndTime(Long auctionEndTime) 
    {
        this.auctionEndTime = auctionEndTime;
    }

    public Long getAuctionEndTime() 
    {
        return auctionEndTime;
    }

    public void setStartPrice(String startPrice) 
    {
        this.startPrice = startPrice;
    }

    public String getStartPrice() 
    {
        return startPrice;
    }

    public void setHighestBid(String highestBid) 
    {
        this.highestBid = highestBid;
    }

    public String getHighestBid() 
    {
        return highestBid;
    }

    public void setSecondHighestBid(String secondHighestBid) 
    {
        this.secondHighestBid = secondHighestBid;
    }

    public String getSecondHighestBid() 
    {
        return secondHighestBid;
    }

    public void setTotalBids(Integer totalBids) 
    {
        this.totalBids = totalBids;
    }

    public Integer getTotalBids() 
    {
        return totalBids;
    }

    public void setStatus(Integer status) 
    {
        this.status = status;
    }

    public Integer getStatus() 
    {
        return status;
    }

    public void setItemCondition(Integer itemCondition) 
    {
        this.itemCondition = itemCondition;
    }

    public Integer getItemCondition() 
    {
        return itemCondition;
    }

    public void setSeller(String seller) 
    {
        this.seller = seller;
    }

    public String getSeller() 
    {
        return seller;
    }

    public void setHighestBidder(String highestBidder) 
    {
        this.highestBidder = highestBidder;
    }

    public String getHighestBidder() 
    {
        return highestBidder;
    }

    public void setTransactionHash(String transactionHash) 
    {
        this.transactionHash = transactionHash;
    }

    public String getTransactionHash() 
    {
        return transactionHash;
    }

    public void setBlockNumber(Long blockNumber) 
    {
        this.blockNumber = blockNumber;
    }

    public Long getBlockNumber() 
    {
        return blockNumber;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("id", getId())
            .append("name", getName())
            .append("category", getCategory())
            .append("imageLink", getImageLink())
            .append("descLink", getDescLink())
            .append("auctionStartTime", getAuctionStartTime())
            .append("auctionEndTime", getAuctionEndTime())
            .append("startPrice", getStartPrice())
            .append("highestBid", getHighestBid())
            .append("secondHighestBid", getSecondHighestBid())
            .append("totalBids", getTotalBids())
            .append("status", getStatus())
            .append("itemCondition", getItemCondition())
            .append("seller", getSeller())
            .append("highestBidder", getHighestBidder())
            .append("transactionHash", getTransactionHash())
            .append("blockNumber", getBlockNumber())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
} 