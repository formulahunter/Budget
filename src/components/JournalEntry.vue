<template>
    <div class="journal-entry">
        <div class="title">
            <h3><span>{{ actv.title }}</span></h3>
        </div>
        <div class="sources">
            <div class="source" v-for="src of actv.sources" :key="src.id">
                <span class="category" :key="`${src.id}-cat`" v-if="src.category !== null">{{ `${src.category.name}: ` }}</span>
                <span class="fund">{{ src.fund.name }}</span>
                &ensp;&ensp;
                <span class="amount">{{ getAmountWithSign('()', src.amount) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import {currencyString} from '../util/utils.js';

    export default {
      name: 'JournalEntry',
      props: {
        actv: Object
      },
      methods: {
        getAmountWithSign(sign, val = this.actv.grossValue) {
          return currencyString(val, sign);
        }
      },
      computed: {
        dateStringShort() {
          return `${this.actv.time.getMonth() + 1}/${this.actv.time.getDate()}`;
        },
        amountString() {
          return currencyString(this.actv.grossValue);
        }
      }
    };
</script>

<style scoped>
    div.journal-entry {
        margin: 0.5em;
    }

    div.journal-entry div.title h3 {
        /*display: inline;*/
        margin-bottom: 0.1em;
        text-decoration: underline;
    }
    div.journal-entry div.category h4 {
        display: inline;
    }
</style>
