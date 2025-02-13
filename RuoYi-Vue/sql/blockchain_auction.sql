-- ----------------------------
-- 1. 区块链拍卖表
-- ----------------------------
drop table if exists blockchain_auction;
create table blockchain_auction (
  id                bigint(20)      not null auto_increment    comment '拍卖ID',
  name              varchar(50)     not null                   comment '商品名称',
  category          varchar(50)     default null               comment '商品类别',
  image_link        varchar(255)    default null               comment '商品图片链接',
  desc_link         varchar(500)    default null               comment '商品描述',
  auction_start_time bigint(20)     not null                   comment '拍卖开始时间',
  auction_end_time   bigint(20)     not null                   comment '拍卖结束时间',
  start_price       varchar(50)     not null                   comment '起拍价(Wei)',
  highest_bid       varchar(50)     default '0'                comment '最高出价(Wei)',
  second_highest_bid varchar(50)    default '0'                comment '次高出价(Wei)',
  total_bids        int(11)         default 0                  comment '出价次数',
  status            tinyint(4)      default 0                  comment '状态（0进行中 1已售出 2流拍）',
  item_condition    tinyint(4)      default 0                  comment '商品状况（0全新 1二手）',
  seller            varchar(42)     not null                   comment '卖家地址',
  highest_bidder    varchar(42)     default null               comment '最高出价者地址',
  transaction_hash  varchar(66)     default null               comment '区块链交易哈希',
  block_number      bigint(20)      default null               comment '区块高度',
  create_time       datetime                                   comment '创建时间',
  update_time       datetime                                   comment '更新时间',
  primary key (id)
) engine=innodb auto_increment=100 comment = '区块链拍卖表';

-- ----------------------------
-- 2. 拍卖出价记录表
-- ----------------------------
drop table if exists blockchain_auction_bid;
create table blockchain_auction_bid (
  id                bigint(20)      not null auto_increment    comment '出价ID',
  auction_id        bigint(20)      not null                   comment '拍卖ID',
  bidder            varchar(42)     not null                   comment '出价者地址',
  bid_amount        varchar(50)     not null                   comment '出价金额(Wei)',
  sealed_bid        varchar(66)     not null                   comment '密封出价哈希',
  revealed          tinyint(1)      default 0                  comment '是否已揭示',
  reveal_time       datetime        default null               comment '揭示时间',
  transaction_hash  varchar(66)     not null                   comment '交易哈希',
  block_number      bigint(20)      not null                   comment '区块高度',
  create_time       datetime                                   comment '创建时间',
  update_time       datetime                                   comment '更新时间',
  primary key (id)
) engine=innodb auto_increment=100 comment = '拍卖出价记录表';

-- ----------------------------
-- 3. 区块链配置表
-- ----------------------------
drop table if exists blockchain_config;
create table blockchain_config (
  id                bigint(20)      not null auto_increment    comment '配置ID',
  config_key        varchar(50)     not null                   comment '配置键',
  config_value      varchar(500)    not null                   comment '配置值',
  config_type       varchar(20)     default 'String'           comment '配置类型',
  remark            varchar(100)    default null               comment '备注',
  create_time       datetime                                   comment '创建时间',
  update_time       datetime                                   comment '更新时间',
  primary key (id),
  unique key uk_config_key (config_key)
) engine=innodb auto_increment=100 comment = '区块链配置表';

-- ----------------------------
-- 初始化区块链配置数据
-- ----------------------------
insert into blockchain_config values(1, 'blockchain.node-url', 'http://localhost:8545', 'String', '区块链节点URL', sysdate(), null);
insert into blockchain_config values(2, 'blockchain.contract-address', '0x0000000000000000000000000000000000000000', 'String', '拍卖合约地址', sysdate(), null);
insert into blockchain_config values(3, 'blockchain.gas-limit', '4300000', 'Long', 'Gas限制', sysdate(), null);
insert into blockchain_config values(4, 'blockchain.gas-price', '20000000000', 'Long', 'Gas价格(Wei)', sysdate(), null); 