import Fund from './Fund.mjs';
import Source from './Source.mjs';

class Account {

    constructor(id) {

        this._id = id;

        this._name = null;
        this._notes = null;

        this._funds = [];
    }

    static fromSQL(record) {

        let acct = new Account(record.id);

        acct._name = record.name;
        if(record.notes) {
            acct._notes = record.notes;
        }

        return acct;
    }

    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get notes() {
        return this._notes;
    }

    /** get the sum of balances of all constituent funds */
    get balance() {
        let balance = 0;
        for(let fund of this._funds) {
            balance += fund.balance;
        }
        return balance;
    }

    /** an account's default/residual fund is taken to be the first in the funds
     * array
     */
    get _defaultFund() {
        return this._funds[0];
    }

    /** check if this account includes a given fund */
    hasFund(fund) {
        return this._funds.includes(fund);
    }

    /** get the fund indicated by the given unique identifier
     *
     * for argument of type:
     *  - string: return the fund whose name matches the argument, or null
     *  - number: return the fund whose id matches the argument, or null
     *  - Source: return the fund acted on by the given source
     *  - undefined: return the default/residual fund for this account
     */
    getFund(ref) {
        if(ref === undefined) {
            return this._defaultFund;
        }
        if(ref instanceof Source) {
            return this._funds.find(val => val === ref.fund);
        }
        if(typeof ref === 'number') {
            return this._funds.find(val => val.id === ref) || null;
        }
        if(typeof ref === 'string') {
            return this._funds.find(val => val.name === ref) || null;
        }
        throw new TypeError(`invalid fund ref type ${ref} for retrieving fund from account`);
    }

    /** add a new fund to this account */
    addFund(fund) {
        if(!(fund instanceof Fund)) {
            throw new TypeError(`non-fund instance ${fund} added to account '${this.name}'`);
        }
        if(this._funds.indexOf(fund) >= 0) {
            throw new Error(`duplicate fund '${fund.name}' added to account '${this.name}'`);
        }

        this._funds.push(fund);
    }

    /** remove a fund from this account
     *
     * any remaining fund balance must be reallocated to another fund before
     * removal
     */
    removeFund(fund) {
        let fundRef = fund;
        if(!(fund instanceof Fund)) {
            fundRef = this.getFund(fund);
        }
        if(fundRef === null) {
            throw new Error(`cannot remove non-existent fund ${fund} from account '${this.name}'`);
        }
        if(fund.balance !== 0) {
            throw new Error(`cannot remove fund '${fund.name}' from account '${this.name}' - non-zero balance ${fund.balance} must be allocated to another fund before removal`);
        }

        return this._funds.splice(this._funds.indexOf(fundRef), 1)[0];
    }
}


export default Account;
