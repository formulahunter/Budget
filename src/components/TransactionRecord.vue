<template>
    <div class="txn-record">
        <div class="title">
            <h3><span>{{ txn.title }}</span></h3>
            <span class="date">{{ txn.dateStringShort }}</span>
        </div>
        <div class="category">
            <h4>
                <span class="cat">{{ txn.category }}</span>
                <span class="subcat" v-if="txn.subcategory"> &ndash; {{ txn.subcategory }}</span>
            </h4>
        </div>
        <div class="value">
            <span class="category">{{ txn.category }}</span>
            <span class="account">{{ txn.account }}</span>
            &nbsp;&ndash;&nbsp;
            <span class="amount">{{ getAmountWithSign('()') }}</span>
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
            getAmountWithSign(sign) {
                return currencyString(this.txn.grossValue, sign);
            }
        },
        computed: {
            dateStringShort() {
                return `${this.txn.date.getMonth() + 1}/${this.txn.date.getDate()}`;
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
        display: inline;
        text-decoration: underline;
    }
    div.txn-record div.category h4 {
        display: inline;
    }
</style>
