class Source {

    constructor(id) {
        this._id = id;

        this._activity = null;
        this._fund = null;
        this._time = null;
        this._category = null;

        this._amount = null;

        this._notes = null;
    }

    static fromSQL(record) {

        let src = new Source(record.id);

        src._activity = record.transactionid;
        src._fund = record.fundid;
        src._time = new Date(record.time);
        src._category = record.categoryid;

        src._amount = record.amount;
        src._notes = record.notes || null;

        return src;
    }

    static resolveRefs(src, records) {
        if(typeof src.activity === 'number') {
            src._activity = records.activities.find(act => act.id === src.activity);
            if(!src.activity.hasSource(src)) {
                src.activity.addSource(src);
            }
        }
        if(typeof src.fund === 'number') {
            src._fund = records.accounts.find(acct => acct.id === src.fund) || records.funds.find(fnd => fnd.id === src.fund);
            if(!src.fund.hasSource(src)) {
                src.fund.addSource(src);
            }
        }
        if(typeof src.category === 'number') {
            src._category = records.categories.find(cat => cat.id === src.category);
            if(!src.category.hasSource(src)) {
                src.category.addSource(src);
            }
        }
    }

    get id() {
        return this._id;
    }

    get activity() {
        return this._activity;
    }
    get fund() {
        return this._fund;
    }
    get time() {
        return this._time;
    }
    get category() {
        return this._category || null;
    }

    get amount() {
        return this._amount;
    }
    get notes() {
        return this._notes || null;
    }
}


export default Source;
