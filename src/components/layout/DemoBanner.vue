<template>
  <div v-if="store.isDemoMode" class="demo-banner">
    <div class="demo-inner">
      <span class="demo-badge">Demo</span>
      <span class="demo-msg">You're in demo mode — exploring a PM Framework workspace with simulated peer comments from Alice and Marcus.</span>
      <button class="exit-btn" @click="exit">Exit demo</button>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../../store'
import { useRouter } from 'vue-router'

const store = useAppStore()
const router = useRouter()

function exit() {
  store.disableDemoMode()
  router.push('/')
}
</script>

<style scoped>
.demo-banner {
  background: #78350f;
  border-bottom: 1px solid #92400e;
  flex-shrink: 0;
}

.demo-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
}

.demo-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #d97706;
  color: #fffbeb;
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;
}

.demo-msg {
  font-size: 0.8125rem;
  color: #fde68a;
  flex: 1;
}

.exit-btn {
  background: transparent;
  border: 1px solid #92400e;
  color: #fbbf24;
  font-size: 0.8125rem;
  padding: 3px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.exit-btn:hover {
  background: rgba(146, 64, 14, 0.5);
}
</style>
