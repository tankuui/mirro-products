# Edge Function 环境变量设置

Edge Function `process-task` 已部署成功，但需要配置环境变量才能正常工作。

## 需要设置的环境变量

在 Supabase Dashboard 中设置以下环境变量：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Edge Functions**
4. 点击 **Add secret** 按钮
5. 添加以下变量：

### OPENROUTER_API_KEY

```
Name: OPENROUTER_API_KEY
Value: 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
```

**注意**：其他环境变量（SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 等）会自动配置，无需手动设置。

## 测试 Edge Function

设置完成后，可以使用以下命令测试：

```bash
curl -X POST \
  https://kqbycaospxztjmverqpz.supabase.co/functions/v1/process-task \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"taskId": "your-task-id"}'
```

## 工作流程

1. 用户通过插件或前端提交任务
2. API 创建任务记录并触发 Edge Function
3. Edge Function 在后台异步处理：
   - 下载图片
   - AI分析和修改图片
   - AI改写商品描述
   - 更新任务进度
4. 前端轮询任务状态，显示实时进度
