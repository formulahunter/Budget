<template>
    <div class="txn-record">
        <div class="title">
            <h3><span>{{ txn.title }}</span></h3>
            <span class="date">{{ dateStringShort }}</span>
        </div>
        <div class="sources">
            <div class="source" v-for="src of txn.sources" :key="src.id">
                <span class="category" :key="`${src.id}-cat`">{{ `${src.category.name}: ` }}</span>
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
        props: {
            txn: Object
        },
        methods: {
            getAmountWithSign(sign, val = this.txn.grossValue) {
                return currencyString(val, sign);
            }
        },
        computed: {
            dateStringShort() {
                return `${this.txn.time.getMonth() + 1}/${this.txn.time.getDate()}`;
            },
            amountString() {
                return currencyString(this.txn.grossValue);
            }
        }
    };
</script>

<style scoped>
    div.txn-record {
        margin: 0.5em;
    }

    div.txn-record div.title h3 {
        /*display: inline;*/
        margin-bottom: 0.1em;
        text-decoration: underline;
    }
    div.txn-record div.category h4 {
        display: inline;
    }
</style>
