<template>
    <div id="budget">
        <div class="summary">
            <div class="available">
                <span>{{ available }}</span>
            </div>
            <div class="scheduled">
                <span></span>
            </div>
            <div class="reserved">
                <span></span>
            </div>
        </div>
      <ActivityTimeline :activities="records.activities"></ActivityTimeline>
    </div>
</template>

<script>
import JournalEntry from './components/JournalEntry.vue'
import ActivityTimeline from './components/ActivityTimeline.vue';
import { currencyString, instantiateSQL } from './util/utils.js';

export default {
  name: 'BudgetApp',
  data() {
    return {
      records: {
        activities: [],
        accounts: [],
        categories: [],
        categoryGroups: [],
        funds: [],
        reserves: [],
        sources: []
      }
    }
  },
  computed: {
    available() {
      let sum = 0;
      for(let act of this.records.activities) {
        sum += act.grossValue;
      }
      return currencyString(sum, '()');
    }
  },
  created() {
    fetch('/budget/data', {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    })
    .then(res => {
      if(res.status !== 200) {
        console.debug('server response: %o', res);
        throw new Error(`cannot get data: response code ${res.status}`);
      }
      return res.json();
    })
    .then(instantiateSQL)
    .then(data => {
      this.records = data;
    })
    .catch(reason => {
      console.error(`error loading app:\n${reason}`);
    });
  },
  components: {
    JournalEntry,
    ActivityTimeline
  }
}
</script>

<style>
body {
  width: 100vw;
  height: 100vh;
  margin: 0;

  background: lightgrey;
}
</style>

  <style scoped>
  #budget {
    height: 90vh;
    width: 65vw;
    margin-left: auto;
    margin-right: auto;

    border: 2px solid #646464;
    border-radius: 0.5em;

    background: darkgrey;

    overflow-y: scroll;
  }

div.summary > div {
  width: 20vw;
  display: inline-block;
  border: 2px solid grey;
}
</style>
