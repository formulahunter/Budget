import Source from './Source.mjs';

class Fund {

    constructor(id) {
        this._id = id;

        this._name = null;
        this._opendate = null;
        this._notes = null;

        //  note that balance is a derived property

        this._virtualAccounts = [];     //  va's that comprise this fund
        this._sources = [];
    }

    static fromSQL(record) {
        let fund = new Fund(record.id);

        fund._name = record.name;
        fund._opendate = record.opendate;

        fund._account = record._accountid;
        fund._balance = record.balance;
        fund._notes = record.notes;

        return fund;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
    get opendate() {
        return this._opendate;
    }
    get account() {
        return this._account;
    }
    get notes() {
        return this._notes;
    }

    get balance() {
        let balance = 0;
        for(let va of this._virtualAccounts) {
            balance += va.balance;
        }
        return balance;
    }

    /** check if this fund includes a given source */
    hasSource(src) {
        return this._sources.includes(src);
    }

    /** add a new source to this fund */
    addSource(src) {
        if(!(src instanceof Source)) {
            throw new TypeError(`non-source instance ${src} added to fund '${this.name}'`);
        }
        if(this._sources.indexOf(src) >= 0) {
            throw new Error(`duplicate source '${src}' added to fund '${this.name}'`);
        }

        this._sources.push(src);
    }

    /** remove a source from this fund */
    removeSrc(src) {
        if(this._sources.indexOf(src) < 0) {
            throw new Error(`cannot remove non-existent source ${src} from fund '${this.name}'`);
        }

        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }

}


export default Fund;
