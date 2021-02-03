import Vue from 'vue'
import App from './App.vue'
import router from './router'
import LazyLoad from 'vue-lazyload'
import store from './store'
import Toast from 'components/common/toast'

Vue.config.productionTip = false

Vue.prototype.$bus = new Vue()

Vue.use(Toast)

Vue.use(LazyLoad, {
  loading: require('assets/img/common/placeholder.png'),//加载中图片，一定要有，不然会一直重复加载占位图
});

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
