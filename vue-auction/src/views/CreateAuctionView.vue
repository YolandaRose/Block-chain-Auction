<template>
  <div class="create-auction-container">
    <div class="form-section">
      <h2 class="page-title">创建新拍卖</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="create-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="拍卖标题" prop="name">
          <el-input v-model="form.name" placeholder="请输入拍卖品名称" />
        </el-form-item>

        <el-form-item label="拍卖描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述拍卖品"
          />
        </el-form-item>

        <el-form-item label="起拍价格" prop="startPrice">
          <el-input-number
            v-model="form.startPrice"
            :precision="3"
            :step="0.1"
            :min="0"
            controls-position="right"
          >
            <template #suffix>ETH</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="拍卖时长" prop="duration">
          <el-select v-model="form.duration" placeholder="请选择拍卖持续时间">
            <el-option label="1小时" :value="1" />
            <el-option label="6小时" :value="6" />
            <el-option label="12小时" :value="12" />
            <el-option label="1天" :value="24" />
            <el-option label="3天" :value="72" />
            <el-option label="7天" :value="168" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择商品分类">
            <el-option
              v-for="cat in categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品状况" prop="condition">
          <el-select v-model="form.condition" placeholder="请选择商品状况">
            <el-option label="全新" :value="0" />
            <el-option label="二手" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品图片" prop="images">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            :auto-upload="false"
            :limit="5"
            list-type="picture-card"
            :on-change="handleImageChange"
            :before-upload="beforeUpload"
          >
            <template #trigger>
              <el-icon><Plus /></el-icon>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png文件，每张不超过5MB，最多5张
                <br>
                图片将保存在本地IPFS节点中
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="submitting"
            :disabled="!isWalletConnected"
          >
            {{ isWalletConnected ? '创建拍卖' : '请先连接钱包' }}
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage, type FormInstance, type UploadFile, ElLoading } from 'element-plus'
import type { UploadUserFile } from 'element-plus'
import { ipfsService } from '../utils/ipfs'

const router = useRouter()
const store = useAuctionStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fileList = ref<UploadUserFile[]>([])

const categories = ['艺术品', '收藏品', '数字资产', '虚拟物品', '其他']

const form = ref({
  name: '',
  description: '',
  startPrice: 0.1,
  duration: 24, // 默认1天
  category: '',
  condition: 0, // 默认全新
  images: [] as string[]
})

const rules = {
  name: [
    { required: true, message: '请输入拍卖品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: false },
    { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
  ],
  startPrice: [
    { required: true, message: '请设置起拍价格', trigger: 'blur' },
    { type: 'number', min: 0.001, message: '价格必须大于0.001 ETH', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请选择拍卖时长', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择商品状况', trigger: 'change' }
  ],
  images: [
    { type: 'array', max: 5, message: '最多上传5张商品图片', trigger: 'change' }
  ]
}

const isWalletConnected = computed(() => !!store.account)

const handleImageChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    ElMessage.error('文件无效')
    return
  }
  
  const loadingInstance = ElLoading.service({
    text: '正在上传到IPFS...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    console.log('准备上传文件:', uploadFile.raw)
    
    // 上传图片到本地IPFS节点
    const hash = await ipfsService.uploadImage(uploadFile.raw)
    console.log('获取到IPFS哈希:', hash)
    
    // 获取IPFS URL
    const ipfsUrl = ipfsService.getIPFSUrl(hash)
    console.log('IPFS URL:', ipfsUrl)
    
    // 更新表单数据
    form.value.images = [...form.value.images, ipfsUrl]
    
    ElMessage.success({
      message: `图片上传成功! CID: ${hash}`,
      duration: 5000
    })
  } catch (error: any) {
    console.error('图片上传失败:', error)
    ElMessage.error({
      message: error.message || 'IPFS上传失败，请检查IPFS节点状态',
      duration: 5000
    })
    // 从文件列表中移除失败的文件
    const index = fileList.value.indexOf(uploadFile)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  } finally {
    loadingInstance.close()
  }
}

const beforeUpload = (file: UploadUserFile) => {
  if (!file.raw) {
    ElMessage.error('文件上传失败')
    return false
  }

  // 检查文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 检查文件大小（限制为5MB）
  const isLt5M = file.raw.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 计算拍卖开始和结束时间（使用秒级时间戳）
    const now = Math.floor(Date.now() / 1000) // 转换为秒级时间戳
    const auctionStartTime = now
    const auctionEndTime = now + (form.value.duration * 3600) // 小时转换为秒
    
    console.log('拍卖时间:', {
      now: new Date(now * 1000).toLocaleString(),
      start: new Date(auctionStartTime * 1000).toLocaleString(),
      end: new Date(auctionEndTime * 1000).toLocaleString(),
      duration: `${form.value.duration}小时`
    })
    
    // 确保所有字符串参数都经过 trim 处理
    const name = form.value.name?.trim() || ''
    const category = form.value.category?.trim() || ''
    const description = form.value.description?.trim() || '无'
    const imageLink = form.value.images?.[0] || ''
    
    // 验证必填字段
    if (!name || !category) {
      throw new Error('请填写所有必填字段')
    }
    
    // 验证时间
    if (auctionEndTime <= auctionStartTime) {
      throw new Error('拍卖结束时间必须大于开始时间')
    }
    
    // 验证起拍价
    if (isNaN(Number(form.value.startPrice)) || Number(form.value.startPrice) <= 0) {
      throw new Error('起拍价必须大于0')
    }
    
    const params = {
      name,
      category,
      imageLink,
      descLink: description,
      auctionStartTime,
      auctionEndTime,
      startPrice: form.value.startPrice.toString(),
      condition: form.value.condition
    }
    
    console.log('准备提交到store的参数:', params)
    
    const txHash = await store.createAuction(params)
    ElMessage.success({
      message: `拍卖创建成功! 交易哈希: ${txHash}`,
      duration: 5000
    })
    router.push('/auctions')
  } catch (error: any) {
    console.error('创建拍卖失败:', error)
    ElMessage.error({
      message: `创建拍卖失败: ${error.message}`,
      duration: 5000
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-auction-container {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-color);
  padding: 40px 0;
  transition: all 0.3s ease;
}

.form-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: var(--bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.page-title {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
}

.create-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.el-form-item__label) {
  color: var(--text-regular);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
  box-shadow: 0 0 0 1px var(--border-color);
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-color);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--text-primary);
  background-color: transparent;
}

:deep(.el-select__wrapper) {
  background-color: var(--bg-color);
}

:deep(.el-select-dropdown__item) {
  color: var(--text-regular);
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: var(--primary-color);
  color: #fff;
}

.el-upload__tip {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.5;
}

.upload-demo :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  line-height: 120px;
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

.upload-demo :deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.upload-demo :deep(.el-upload-list__item) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

@media (max-width: 768px) {
  .create-auction-container {
    padding: 20px 0;
  }

  .form-section {
    padding: 20px;
    margin: 0 16px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style> 