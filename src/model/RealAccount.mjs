import AbstractAccount from './AbstractAccount.mjs';
import Source from './Source.mjs';
import VirtualAccount from './VirtualAccount.mjs';

class RealAccount extends AbstractAccount {

    constructor(id) {
        super(id);

        this._type = null;
        this._interestRate = null;
        this._interestPeriod = null;

        this._virtualAccounts = [];     //  va's that belong to this account
        this._sources = [];
    }

    static fromSQL(record) {

        let ra = new RealAccount(record.id);

        ra._name = record.name;
        ra._balance = Number(record.balance);
        ra._opendate = new Date(record.opendate);
        ra._notes = record.notes;

        ra._type = record.type;
        ra._interestRate = Number(record.interest_rate);
        ra._interestPeriod = Number(record.interest_period);
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

    /** check if this account includes a given virtual account */
    hasVirtualAccount(va) {
        if(!(va instanceof VirtualAccount)) {
            console.debug('%o is not a VirtualAccount', va);
        }
        return this._virtualAccounts.includes(va);
    }

    /** add a new virtual account to this account */
    addVirtualAccount(va) {
        if(!(va instanceof VirtualAccount)) {
            console.debug('%o is not a VirtualAccount', va);
            throw new TypeError('invalid argument');
        }
        if(this.hasVirtualAccount(va)) {
            console.debug('virtual account %o was redundantly added to real account %o', va, this);
        }

        this._virtualAccounts.push(va);
    }

    /** remove a virtual account from this account
     *
     * any remaining virtual account balance must be reallocated to another
     * account before removal
     */
    removeVirtualAccount(va) {
        if(!this.hasVirtualAccount(va)) {
            console.debug('provided virtual account %o does not belong to this real account %o', va, this);
            throw new Error('invalid argument');
        }
        if(va.balance !== 0) {
            console.debug('virtual account %o has a non-zero balance and so cannot be removed from real account %o', va, this);
            throw new Error('nonzero balance');
        }

        return this._virtualAccounts.splice(this._virtualAccounts.indexOf(va), 1)[0];
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
            console.debug('%o is not a Source ', src);
            throw new TypeError('invalid argument');
        }
        if(this.hasSource(src)) {
            console.debug('source %o was redundantly added to real account %o', src, this);
        }

        this._sources.push(src);
    }

    /** remove a source from this fund */
    removeSrc(src) {
        if(!this.hasSource(src)) {
            console.debug('provided source %o does not belong to this real account %o', src, this);
            throw new Error('invalid argument');
        }

        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }
}


export default RealAccount;
