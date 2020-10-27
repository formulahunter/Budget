import Vue from 'vue'
import BudgetApp from './BudgetApp.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(BudgetApp),
}).$mount('#app')
