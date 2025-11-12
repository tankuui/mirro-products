const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('\n🔍 验证 Edge Function 是否使用新代码...\n');
  
  // 查看最近任务的详细日志
  const { data: logs } = await supabase
    .from('task_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (logs && logs.length > 0) {
    console.log('查找关键字:\n');
    
    const keywords = [
      '详细提示词',
      'detailed prompt',
      'Using detailed modification prompt',
      'chars',
      'Detailed image analysis'
    ];
    
    let foundNew = false;
    keywords.forEach(keyword => {
      const found = logs.filter(log => log.message.includes(keyword));
      if (found.length > 0) {
        console.log(`✅ 找到 "${keyword}" - ${found.length} 次`);
        console.log(`   最近一次: ${new Date(found[0].created_at).toLocaleString('zh-CN')}`);
        foundNew = true;
      } else {
        console.log(`❌ 未找到 "${keyword}"`);
      }
    });
    
    console.log('\n最近的日志内容:\n');
    logs.slice(0, 5).forEach((log, i) => {
      console.log(`${i + 1}. [${log.log_type.toUpperCase()}] ${log.message}`);
      console.log(`   时间: ${new Date(log.created_at).toLocaleString('zh-CN')}\n`);
    });
    
    if (!foundNew) {
      console.log('⚠️  结论：Edge Function 可能还是旧版本！\n');
      console.log('建议：');
      console.log('1. 在 Supabase Dashboard 重新部署 Edge Function');
      console.log('2. 确认点击了 Deploy 按钮');
      console.log('3. 等待部署完成后再测试\n');
    } else {
      console.log('✅ 结论：Edge Function 已更新为新版本！\n');
    }
  }
})();
