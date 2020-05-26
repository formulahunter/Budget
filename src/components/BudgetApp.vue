<template>
    <div id="#budget">
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
        <div class="timeline">
            <TransactionRecord
                    v-for="txn of records.transactions"
                    :txn="txn"
                    :key="txn.id">

            </TransactionRecord>
        </div>
    </div>
</template>

<script>
    import TransactionRecord from './TransactionRecord.vue';
    import {currencyString} from '../util/utils.js';

    export default {
        props: {
            records: {
                type: Object,
                default() {
                    return {
                        transactions: [],
                        categories: [],
                        accounts: [],
                        funds: [],
                        sources: []
                    };
                }
            }
        },
        computed: {
            available() {
                let sum = 0;
                for(let txn of this.records.transactions) {
                    sum += txn.grossValue;
                }
                return currencyString(sum, '()');
            },
            scheduled() {
                return 0;
            },
            reserved() {
                return 0;
            }
        },
        components: {
            TransactionRecord
        }
    };
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
