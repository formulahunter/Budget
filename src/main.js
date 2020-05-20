import Vue from 'vue';
import BudgetApp from './components/BudgetApp.vue';

fetch('/data', {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  new Vue({
    el: '#app',
    data: { records: data },
    template: '<BudgetApp :records="records"></BudgetApp>',
    components: { BudgetApp }
  });
})
.catch(reason => {
  console.error(`error loading app: ${reason}`);
});

