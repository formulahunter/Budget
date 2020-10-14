import Fund from './Fund.mjs';
import Source from './Source.mjs';
import Reserve from './Reserve.mjs';

class Account extends Fund {

    constructor(id) {
        super(id);

        this._balance = null;
        this._type = null;
        this._interestRate = null;
        this._interestPeriod = null;

        this._reserves = [];    //  va's that belong to this account
        this._sources = [];     //  accounts may serve as sources
    }

    static fromSQL(record) {

        let acct = new Account(record.id);

        acct._name = record.name;
        acct._opendate = new Date(record.opendate);
        acct._closedate = record.closedate ? new Date(record.closedate) : null;
        acct._notes = record.notes || null;

        acct._balance = Number(record.balance);
        acct._type = record.type;
        acct._interestRate = Number(record.interest_rate);
        acct._interestPeriod = Number(record.interest_period);

        return acct;
    }

    get balance() {
        return this._balance;
    }
    get type() {
        return this._type;
    }
    get interestRate() {
        return this._interestRate;
    }
    get interestPeriod() {
        return this._interestPeriod;
    }


    /** check if this account includes a given reserve */
    hasReserve(rsv) {
        if(!(rsv instanceof Reserve)) {
            console.debug('%o is not a Reserve', rsv);
        }
        return this._reserves.includes(rsv);
    }
    /** add a new reserve to this account */
    addReserve(rsv) {
        if(!(rsv instanceof Reserve)) {
            console.debug('%o is not a Reserve', rsv);
            throw new TypeError('invalid argument');
        }
        if(this.hasReserve(rsv)) {
            console.debug('Reserve %o was redundantly added to Account %o', rsv, this);
        }
        this._reserves.push(rsv);
    }
    /** remove a reserve from this account */
    removeReserve(rsv) {
        if(!this.hasReserve(rsv)) {
            console.debug('provided Reserve %o does not belong to this Account %o', rsv, this);
            throw new Error('invalid argument');
        }
        return this._reserves.splice(this._reserves.indexOf(rsv), 1)[0];
    }

    /** check if this account includes a given source */
    hasSource(src) {
        if(!(src instanceof Source)) {
            console.debug('%o is not a Source', src);
        }
        return this._sources.includes(src);
    }
    /** add a new source to this account */
    addSource(src) {
        if(!(src instanceof Source)) {
            console.debug('%o is not a Source', src);
            throw new TypeError('invalid argument');
        }
        if(this.hasSource(src)) {
            console.debug('Source %o was redundantly added to Account %o', src, this);
        }
        this._sources.push(src);
    }
    /** remove a source from this account */
    removeSrc(src) {
        if(!this.hasSource(src)) {
            console.debug('provided Source %o does not belong to this Account %o', src, this);
            throw new Error('invalid argument');
        }
        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }
}


export default Account;
