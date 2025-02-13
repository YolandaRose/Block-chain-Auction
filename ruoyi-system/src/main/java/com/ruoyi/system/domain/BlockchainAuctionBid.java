package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 拍卖出价记录对象 blockchain_auction_bid
 * 
 * @author ruoyi
 */
public class BlockchainAuctionBid extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 出价ID */
    private Long id;

    /** 拍卖ID */
    @Excel(name = "拍卖ID")
    private Long auctionId;

    /** 出价者地址 */
    @Excel(name = "出价者地址")
    private String bidder;

    /** 出价金额(Wei) */
    @Excel(name = "出价金额(Wei)")
    private String bidAmount;

    /** 密封出价哈希 */
    @Excel(name = "密封出价哈希")
    private String sealedBid;

    /** 是否已揭示 */
    @Excel(name = "是否已揭示")
    private Boolean revealed;

    /** 揭示时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "揭示时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date revealTime;

    /** 交易哈希 */
    @Excel(name = "交易哈希")
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

    public void setAuctionId(Long auctionId) 
    {
        this.auctionId = auctionId;
    }

    public Long getAuctionId() 
    {
        return auctionId;
    }

    public void setBidder(String bidder) 
    {
        this.bidder = bidder;
    }

    public String getBidder() 
    {
        return bidder;
    }

    public void setBidAmount(String bidAmount) 
    {
        this.bidAmount = bidAmount;
    }

    public String getBidAmount() 
    {
        return bidAmount;
    }

    public void setSealedBid(String sealedBid) 
    {
        this.sealedBid = sealedBid;
    }

    public String getSealedBid() 
    {
        return sealedBid;
    }

    public void setRevealed(Boolean revealed) 
    {
        this.revealed = revealed;
    }

    public Boolean getRevealed() 
    {
        return revealed;
    }

    public void setRevealTime(Date revealTime) 
    {
        this.revealTime = revealTime;
    }

    public Date getRevealTime() 
    {
        return revealTime;
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
            .append("auctionId", getAuctionId())
            .append("bidder", getBidder())
            .append("bidAmount", getBidAmount())
            .append("sealedBid", getSealedBid())
            .append("revealed", getRevealed())
            .append("revealTime", getRevealTime())
            .append("transactionHash", getTransactionHash())
            .append("blockNumber", getBlockNumber())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
} 