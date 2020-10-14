import Fund from './Fund.mjs';

class Account extends Fund {

    constructor(id) {
        super(id);

        this._balance = null;
        this._type = null;
        this._interestRate = null;
        this._interestPeriod = null;
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
}


export default Account;
