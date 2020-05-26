import Vue from 'vue';
import BudgetApp from './components/BudgetApp.vue';
import {instantiateSQL} from './util/utils.js';

Vue.config.productionTip = false;

let vm = new Vue({
  el: '#app',
  data: {
    records: undefined
  },
  template: '<BudgetApp :records="records"></BudgetApp>',
  components: { BudgetApp },
  created() {

    fetch('/data', {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    })
    .then(res => res.json())
    .then(instantiateSQL)
    .then(data => {
      vm.records = data;
    })
    .catch(reason => {
      console.error(`error loading app: ${reason}`);
    });
  }
});

