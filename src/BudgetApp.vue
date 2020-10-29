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
      <JsonUpload @upload="importJSON"></JsonUpload>
      <ActivityTimeline :activities="records.activities"></ActivityTimeline>
    </div>
</template>

<script>
import ActivityTimeline from './components/ActivityTimeline.vue';
import JsonUpload from './components/JsonUpload.vue';
import Activity from './model/Activity.mjs';
import Category from './model/Category.mjs';
import CategoryGroup from './model/CategoryGroup.mjs';
import Fund from './model/Fund.mjs';
import Reserve from './model/Reserve.mjs';
import Source from './model/Source.mjs';
import { currencyString, instantiateSQL } from './util/utils.js';


const record_types = [
  'JOURNALENTRY',
  'HOLD'
];
const transaction_types = [
  'protected_goal_account_transfer',
  'signature_purchase',
  'pin_purchase',
  'ach',
  'signature_credit',
  'check_deposit',
  'round-up_transfer',
  'interest_credit',
  'refund',
  'fee'
];
const bookkeeping_types = [
  'debit',
  'credit'
];
const badges = [
  'TRANSFER',
  'CHECK_DEPOSIT',
  'TIP',
  'ATM_FEE',
  'HOLD'
];

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
  methods: {
    async importJSON(json) {
      console.info('uploading json file');

      //  construct model instances & link them
      //  add new instance to database in this order:
      //    1. accounts, funds, category groups, activities
      //    2. categories, reserves
      //    3. sources
      //  after each step, assign generated record id's to respective instances
      /*
          this method extracts property values from parsed json and, where there
          is no existing record that corresponds, constructs new model instances
          to be saved to the server.

          constructed instances may reference other instances with undefined id
          properties, namely where they reference other newly constructed
          instances. for example, if an entirely new category group is extracted
          from json, then neither that group nor its constituent categories will
          have id's. in such cases, it is necessary to first add the independent
          classes to the database so that they may be assigned id's with which
          the dependent classes can then be inserted with.
       */

      const newRecords = {
        categories: {},
        accounts: [],
        funds: {},
        reserves: [],
        sources: [],
        activities: []
      };

      //  assign temporary unique identifiers to every new model instance
      let newId = 0;

      //  define the default/fallback account
      let chk = this.records.accounts.find(account => account.name === 'Checking');
      // if(!chk) {                                         //  inserting single account manually for now
      //   chk = Account.fromSQL({                          //
      //     id: null,                                      //
      //     name: 'Checking',                              //
      //     balance: 0,                                    //
      //     opendate: new Date(2019, 10, 13, 13, 13),      //
      //     closedate: null,                               //
      //     type: 'd',                                     //
      //     interestRate: 0.6,                             //
      //     interestPeriod: 6,                             //
      //     notes: null                                    //
      //   });                                              //
      //   chk.tempId = newId++;                            //
      //   newRecords.accounts.push(chk);                   //
      // }                                                  //

      //  construct new data records and assign references to existing records
      for(let i = 0; i < json.transactions.length; i++) {

        const tx = json.transactions[i];
        const time = new Date(tx.times.when_recorded);

        //  create an activity instance representing the current transaction
        const activity = Activity.fromSQL({
          id: null,
          title: tx.description,
          time: time,
          notes: tx.memo || null
        });
        activity.tempId = newId++;
        newRecords.activities.push(activity);

        //  define category, group as necessary
        const groupName = tx.categories[0].folder;

        //  check existing records first, then newly constructed instances
        let group = this.records.categoryGroups.find(grp => grp.name === groupName)
                      || newRecords.categories[groupName];
        if(!group) {
          group = CategoryGroup.fromSQL({
            id: null,
            name: groupName,
            notes: null
          });
          group.tempId = newId++;
          newRecords.categories[groupName] = group;
        }

        const catName = tx.categories[0].name;
        let category = this.records.categories.find(cat => cat.name === catName)
                        || group.categories.find(cat => cat.name === catName);
        if(!category) {
          category = Category.fromSQL({
            id: null,
            name: catName,
            group: group, //  use group instance in case id is not yet assigned
            notes: null
          });
          category.tempId = newId++;
          group.addCategory(category);
        }

        //  define fund as necessary
        const fundName = tx.associated_goal_info?.name;
        let fund = this.records.funds.find(fnd => fnd.name === fundName)
                        || newRecords.funds[fundName];
        if(fundName) {
          if(!fund) {
            fund  = Fund.fromSQL({
              id: null,
              name: fundName,
              opendate: time,
              closedate: null,
              notes: null
            });
            fund.tempId = newId++;
            newRecords.funds[fundName] = fund;

            // link the new fund the the default account
            const reserve = Reserve.fromSQL({
              id: null,
              account: chk,
              fund: fund,
              amount: 0,
              opendate: time
            });
            reserve.tempId = newId++;
            newRecords.reserves.push(reserve);
            fund.addReserve(reserve);
          }
        }
        else {
          fund = chk;
        }

        const src = Source.fromSQL({
          id: null,
          activity: activity,
          fund: fund,
          category: category,
          amount: tx.bookkeeping_type === 'debit' ? -1 * tx.amounts.amount : tx.amounts.amount
        });
        src.tempId = newId++;
        newRecords.sources.push(src);
        activity.addSource(src);
        src.fund.addSource(src);
        category.addSource(src);


        //  check for unrecognized parameters, unexpected conditions
        if(!record_types.includes(tx.record_type)) {
          console.warn(`unrecognized record_type: ${tx.record_type}`);
        }
        if(!transaction_types.includes(tx.transaction_type)) {
          console.warn(`unrecognized transaction_type: ${tx.transaction_type}`);
        }
        if(!bookkeeping_types.includes(tx.bookkeeping_type)) {
          console.error(`unrecognized bookkeeping_type: ${tx.bookkeeping_type}`);
          throw new Error('unknown bookkeeping_type');
        }

        if(tx.categories.length !== 1) {
          console.error(`transaction ${i} has ${tx.categories.length} categories`);
          throw new Error('multiple categories');
        }
        if(tx.amounts.base + (tx.amounts.tip || 0) + tx.amounts.fees + tx.amounts.cashback !== tx.amounts.amount) {
          console.error(`transaction ${i}\nbase:     ${tx.amounts.base}\ntip:      ${tx.amounts.tip}\nfees:     ${tx.amounts.fees}\ncashback: ${tx.amounts.cashback}\n`);
          throw new Error('transaction base amount is not equal to sum of component amounts');
        }
        if(tx.amounts.amount !== tx.amounts.cleared) {
          console.warn('transaction appears to be pending/incomplete');
          console.info(`transaction ${i}\nbase:    ${tx.amounts.amount}\ncleared: ${tx.amounts.cleared}`);
        }

        if(tx.badges.length > 0 && tx.badges.some(b => !badges.includes(b.value))) {
          console.info('unrecognized transaction badges: %o', tx.badges);
        }
      }

      //  save new records to database
      //    1. accounts, funds, category groups, activities
      //    2. categories, reserves
      //    3. sources

      //  accounts must be processed separately as their attributes are split between two tables
      //  the first fetch() labels accounts as 'funds' to ensure they are inserted into the proper table
      // types = {
      //   funds: newRecords.accounts.map(acct => {  //  see note above regarding 'funds' label
      //     return {
      //       id: null,
      //       name: acct.name,
      //       opendate: dateToSQLString(acct.opendate),
      //       closedate: acct.closedate ? dateToSQLString(acct.closedate) : null,
      //       notes: acct.notes
      //     };
      //   })
      // };
      // res = await fetch('/budget/upload', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     accept: 'application/json'
      //   },
      //   body: JSON.stringify({types})
      // });
      // if(res.statusCode < 200 || res.statusCode > 299) {
      //   console.error('error uploading independent types: server responded with a non-success status code');
      //   console.debug(res);
      //   return false;
      // }
      // //  now add to this.records
      // ids = await res.json();
      // for(let account of types.funds) {
      //   account._id = ids.funds.find(id => id.tempId === account.tempId).assignedId;
      //   //  don't add to this.records yet - wait until after corresponding entries in 'accounts' table
      //
      //   account.tempId = null;
      //   delete account.tempId;
      // }
      // types = {
      //   accounts: newRecords.accounts.map(acct => {
      //     return {
      //       id: acct.id,
      //       type: acct.type,
      //       balance: acct.balance,
      //       interestRate: acct.interestRate,
      //       interestPeriod: acct.interestPeriod
      //     };
      //   })
      // };
      // res = await fetch('/budget/upload', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     accept: 'application/json'
      //   },
      //   body: JSON.stringify({types})
      // });
      // if(res.statusCode < 200 || res.statusCode > 299) {
      //   console.error('error uploading independent types: server responded with a non-success status code');
      //   console.debug(res);
      //   return false;
      // }
      // for(let account of types.accounts) {
      //   //  now add to this.records
      //   this.records.accounts.push(account);
      // }

      //  funds, category groups, activities
      let types = {
        funds: Object.values(newRecords.funds),
        categoryGroups: Object.values(newRecords.categories),
        activities: newRecords.activities
      };
      let res = await fetch('/budget/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({types})
      });
      if(res.statusCode < 200 || res.statusCode > 299) {
        console.error('error uploading independent types: server responded with a non-success status code');
        console.debug(res);
        return false;
      }
      let ids = await res.json();
      for(let fund of types.funds) {
        fund._id = ids.funds.find(id => id.tempId === fund.tempId).assignedId;
        this.records.funds.push(fund);

        fund.tempId = null;
        delete fund.tempId;
      }
      for(let group of types.categoryGroups) {
        group._id = ids.categoryGroups.find(id => id.tempId === group.tempId).assignedId;
        this.records.categoryGroups.push(group);

        group.tempId = null;
        delete group.tempId;
      }
      for(let activity of types.activities) {
        activity._id = ids.activities.find(id => id.tempId === activity.tempId).assignedId;
        this.records.activities.push(activity);

        activity.tempId = null;
        delete activity.tempId;
      }

      //  categories, reserves
      types = {
        categories: Object.values(newRecords.categories).flatMap(group => group.categories),
        reserves: newRecords.reserves
      };
      res = await fetch('/budget/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({types})
      });
      if(res.statusCode < 200 || res.statusCode > 299) {
        console.error('error uploading dependent types: server responded with a non-success status code');
        console.debug(res);
        return false;
      }
      ids = await res.json();
      for(let category of types.categories) {
        category._id = ids.categories.find(id => id.tempId === category.tempId).assignedId;
        this.records.categories.push(category);

        category.tempId = null
        delete category.tempId;
      }
      for(let reserve of types.reserves) {
        reserve._id = ids.reserves.find(id => id.tempId === reserve.tempId).assignedId;
        this.records.reserves.push(reserve);

        reserve.tempId = null
        delete reserve.tempId;
      }

      //  sources
      types = {
        sources: newRecords.sources
      };
      res = await fetch('/budget/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({types})
      });
      if(res.statusCode < 200 || res.statusCode > 299) {
        console.error('error uploading composite types: server responded with a non-success status code');
        console.debug(res);
        return false;
      }
      ids = await res.json();
      for(let source of types.sources) {
        source._id = ids.sources.find(id => id.tempId === source.tempId).assignedId;
        this.records.sources.push(source);

        source.tempId = null
        delete source.tempId;
      }
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
    ActivityTimeline,
    JsonUpload
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
