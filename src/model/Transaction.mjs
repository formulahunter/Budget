import Source from './Source.mjs';


class Transaction {

    constructor(id) {

        this.id = id;

        this.title;
        this.time;

        this.notes;

        this._sources = [];
    }

    static fromSQL(record) {

        let txn = new Transaction(record.id);

        txn.title = record.title;
        txn.time = new Date(record.time);

        if(record.notes) {
            txn.notes = record.notes;
        }

        return txn;
    }

    static fromJSON(jobj) {

        let txn = new Transaction(jobj.uuid);

        txn.title = jobj.description;
        txn.date = new Date(jobj.times.when_recorded);

        if(jobj.associated_goal_info?.is_actually_associated === true) {
            txn.account = jobj.associated_goal_info.name;
        }
        else {
            txn.account = 'Safe-to-spend';
        }

        //  what are the differences between amount, cleared, and base?
        txn.amount = jobj.amounts.amount;

        //  probably one of 'debit' or 'credit'
        txn.type = jobj.bookkeeping_type;

        txn.category = jobj.categories[0].folder;
        txn.subcategory = jobj.categories[0].name;

        txn.notes = jobj.memo || '';

        return txn;
    }

    get sqlDate() {
        return this.time.toJSON().replace('T', ' ').substring(0, 23);
    }

    set sqlDate(dateStr) {

        let date = new Date();
        date.setUTCFullYear(Number(dateStr.substring(0, 4)));
        date.setUTCMonth(Number(dateStr.substring(5, 7)) - 1);
        date.setUTCDate(Number(dateStr.substring(8, 10)));
        date.setUTCHours(Number(dateStr.substring(11, 13)));
        date.setUTCMinutes(Number(dateStr.substring(14, 16)));
        date.setUTCSeconds(Number(dateStr.substring(17, 19)));
        date.setUTCMilliseconds(Number(dateStr.substring(20)));
        if(Number.isNaN(date.getTime())) {
            throw new Error(`invalid sql date ${dateStr}`);
        }

        this.time = date;
    }

    /** check if this transaction includes a given source */
    hasSource(src) {
        return this._sources.includes(src);
    }

    /** get the sources array for iteration */
    get sources() {
        return this._sources;
    }

    /** add a new source to this transaction */
    addSource(src) {
        if(!(src instanceof Source)) {
            throw new TypeError(`non-source instance ${src} added to transaction '${this.title}'`);
        }
        if(this._sources.indexOf(src) >= 0) {
            throw new Error(`duplicate source '${src}' added to transaction '${this.title}'`);
        }

        this._sources.push(src);
    }

    /** remove a source from this transaction */
    removeSrc(src) {
        if(this._sources.indexOf(src) < 0) {
            throw new Error(`cannot remove non-existent fund ${src} from transaction '${this.title}'`);
        }

        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }

    get grossValue() {
        let val = 0;
        for(let src of this._sources) {
            val += src.netValue;
        }
        return val;
    }
}



export default Transaction;
