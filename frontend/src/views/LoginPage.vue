<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">欢迎登录</h1>
      <p class="subtitle">请输入账号和密码继续访问系统</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="field">
          <span>账号</span>
          <input
            v-model.trim="form.username"
            type="text"
            placeholder="请输入账号"
            autocomplete="username"
            required
          />
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </label>

        <label class="remember-me">
          <input v-model="form.rememberMe" type="checkbox" />
          <span>记住我</span>
        </label>

        <button class="login-button" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <button
          class="text-button"
          type="button"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '隐藏密码' : '显示密码' }}
        </button>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const handleLogin = async () => {
  errorMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = '账号和密码不能为空'
    return
  }

  loading.value = true
  try {
    /**
     * TODO:
     * 1. 替换为真实登录 API，例如：
     *    await login({ username: form.username, password: form.password })
     * 2. 登录成功后跳转到首页。
     */
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log('登录参数：', { ...form })
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #eef2ff, #f5f7ff 50%, #eef6ff);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.12);
}

.title {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.subtitle {
  margin: 10px 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.field input {
  height: 42px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
}

.login-button {
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background: #4338ca;
}

.login-button:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

.text-button {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.error-msg {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
}
</style>
