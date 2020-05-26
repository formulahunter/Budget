import Account from '../model/Account.mjs';
import Transaction from '../model/Transaction.mjs';
import Category from '../model/Category.mjs';
import Fund from '../model/Fund.mjs';
import Source from '../model/Source.mjs';

function instantiateSQL(jdat) {

    let inst = {
        accounts: jdat.accounts.map(Account.fromSQL),
        transactions: jdat.transactions.map(Transaction.fromSQL),
        categories: jdat.categories.map(Category.fromSQL),
        funds: jdat.funds.map(Fund.fromSQL),
        sources: jdat.sources.map(Source.fromSQL)
    };
    linkReferences(inst);
    return inst;
}
function linkReferences(data) {

    let fundRefs = [];
    let catRefs = [];
    for(let src of data.sources) {
        let txn = data.transactions.find(val => val.id === src.transaction['_']);
        src._transaction = txn;
        txn.addSource(src);

        let fundid = src.fund['_'];
        let fund = fundRefs[fundid];
        if(!fund) {
            fund = data.funds.find(val => val.id === fundid);
            fundRefs[fundid] = fund;
        }
        src._fund = fund;
        fund.addSource(src);


        if(src.category) {
            let catid = src.category['_'];
            let cat = catRefs[catid];
            if(!cat) {
                cat = data.categories.find(val => val.id === catid);
                catRefs[catid] = cat;
            }
            src._category = cat;
            cat.addSource(src);
        }
    }

    let acctRefs = [];
    for(let fund of data.funds) {
        let acctid = fund.account['_'];
        let acct = acctRefs[acctid];
        if(!acct) {
            acct = data.accounts.find(val => val.id === acctid);
            acctRefs[acctid] = acct;
        }
        fund._account = acct;
        acct.addFund(fund);
    }
}

function currencyString(centsX100, sign) {
    let str = `$${((Math.abs(centsX100) / 10000).toFixed(2))}`;
    if(sign && centsX100 < 0) {
        str = `${sign[0]}${str}${sign[1] ? sign[1] : ''}`;
    }
    return str;
}

export {instantiateSQL, linkReferences, currencyString};
