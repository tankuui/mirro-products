const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('\n🔍 ========== Storage 配置检查 ==========\n');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  try {
    console.log('1️⃣ 检查 Storage Buckets:');
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log('❌ 无法获取 buckets:', bucketsError.message);
    } else {
      console.log(`找到 ${buckets.length} 个 buckets:`);
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (public: ${bucket.public})`);
      });
      
      const productImagesBucket = buckets.find(b => b.name === 'product-images');
      if (productImagesBucket) {
        console.log('\n✅ product-images bucket 存在');
        console.log(`   Public: ${productImagesBucket.public}`);
      } else {
        console.log('\n❌ product-images bucket 不存在！');
        console.log('\n🔧 解决方案:');
        console.log('1. 打开 Supabase Dashboard');
        console.log('2. 进入 Storage 页面');
        console.log('3. 点击 "New bucket"');
        console.log('4. Name: product-images');
        console.log('5. 勾选 "Public bucket"');
        console.log('6. 点击 "Create bucket"');
      }
    }
    
    console.log('\n2️⃣ 测试文件上传:');
    
    // 创建一个测试文件
    const testContent = 'test file';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt');
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('product-images')
      .upload(`test_${Date.now()}.txt`, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.log('❌ 上传测试失败:', uploadError.message);
      console.log('   错误代码:', uploadError.statusCode || uploadError.error);
      
      if (uploadError.message.includes('not found')) {
        console.log('\n💡 错误原因: product-images bucket 不存在');
        console.log('   请按照上面的步骤创建 bucket');
      } else if (uploadError.message.includes('policy')) {
        console.log('\n💡 错误原因: Storage 权限策略问题');
        console.log('   需要设置 RLS 策略允许上传');
      } else if (uploadError.message.includes('JWT')) {
        console.log('\n💡 错误原因: 认证问题');
        console.log('   检查 SUPABASE_ANON_KEY 是否正确');
      }
    } else {
      console.log('✅ 上传测试成功！');
      console.log('   文件路径:', uploadData.path);
      
      // 清理测试文件
      await supabase
        .storage
        .from('product-images')
        .remove([uploadData.path]);
      console.log('✅ 测试文件已清理');
    }
    
    console.log('\n3️⃣ 检查 Storage 策略:');
    console.log('请确认在 Supabase Dashboard → Storage → product-images → Policies 中有以下策略:');
    console.log('  - SELECT: 允许所有人读取');
    console.log('  - INSERT: 允许所有人上传');
    console.log('  - UPDATE: 允许所有人更新');
    console.log('  - DELETE: 允许所有人删除');
    
    console.log('\n🔍 ========== 检查完成 ==========\n');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
})();

