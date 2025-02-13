package com.ruoyi.system.domain;

import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 区块链配置对象 blockchain_config
 * 
 * @author ruoyi
 */
public class BlockchainConfig extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 配置ID */
    private Long id;

    /** 配置键 */
    @Excel(name = "配置键")
    private String configKey;

    /** 配置值 */
    @Excel(name = "配置值")
    private String configValue;

    /** 配置类型 */
    @Excel(name = "配置类型")
    private String configType;

    /** 备注 */
    @Excel(name = "备注")
    private String remark;

    public void setId(Long id) 
    {
        this.id = id;
    }

    public Long getId() 
    {
        return id;
    }

    public void setConfigKey(String configKey) 
    {
        this.configKey = configKey;
    }

    public String getConfigKey() 
    {
        return configKey;
    }

    public void setConfigValue(String configValue) 
    {
        this.configValue = configValue;
    }

    public String getConfigValue() 
    {
        return configValue;
    }

    public void setConfigType(String configType) 
    {
        this.configType = configType;
    }

    public String getConfigType() 
    {
        return configType;
    }

    @Override
    public void setRemark(String remark) 
    {
        this.remark = remark;
    }

    @Override
    public String getRemark() 
    {
        return remark;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("id", getId())
            .append("configKey", getConfigKey())
            .append("configValue", getConfigValue())
            .append("configType", getConfigType())
            .append("remark", getRemark())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}