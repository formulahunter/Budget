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

    fetch('/budget/data', {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    })
    .then(res => {
      if(res.status !== 200) {
        console.debug(`server response status code: ${res.status}`);
        console.debug('server response: %o', res);
        throw new Error('bad server response');
      }
      return res.json();
    })
    .then(instantiateSQL)
    .then(data => {
      vm.records = data;
    })
    .catch(reason => {
      console.error(`error loading app: ${reason}`);
    });
  }
});

