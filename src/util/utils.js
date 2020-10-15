import CategoryGroup from '../model/CategoryGroup.mjs';
import Account from '../model/Account.mjs';
import Activity from '../model/Activity.mjs';
import Category from '../model/Category.mjs';
import Fund from '../model/Fund.mjs';
import Reserve from '../model/Reserve.mjs';
import Source from '../model/Source.mjs';

function instantiateSQL(jdat) {

    let records = {
        accounts: jdat.accounts.map(Account.fromSQL),
        funds: jdat.funds.map(Fund.fromSQL),
        reserves: jdat.reserves.map(Reserve.fromSQL),
        activities: jdat.activities.map(Activity.fromSQL),
        categories: jdat.categories.map(Category.fromSQL),
        categoryGroups: jdat.categoryGroups.map(CategoryGroup.fromSQL),
        sources: jdat.sources.map(Source.fromSQL)
    };

    //  resolve id references
    //  this process requires refs be resolved in a specific order
    //  use caution if reordering these calls, best leave them if possible
    records.categories.forEach(cat => Category.resolveRefs(cat, records));
    records.reserves.forEach(rsv => Reserve.resolveRefs(rsv, records));
    records.sources.forEach(src => Source.resolveRefs(src, records));

    return records;
}

function currencyString(centsX100, sign) {
    let str = `$${((Math.abs(centsX100) / 10000).toFixed(2))}`;
    if(sign && centsX100 < 0) {
        str = `${sign[0]}${str}${sign[1] ? sign[1] : ''}`;
    }
    return str;
}

export {instantiateSQL, currencyString};
