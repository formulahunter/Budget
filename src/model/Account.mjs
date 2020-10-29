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

        return Object.assign(
            new Account(record.id),
            super.fromSQL(record),
            {
                _balance: Number(record.balance),
                _type: record.type,
                _interestRate: Number(record.interest_rate),
                _interestPeriod: Number(record.interest_period)
            }
        );
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

    toJSON() {
        return Object.assign(super.toJSON(),{
            balance: this.balance,
            type: this.type,
            interestRate: this.interestRate,
            interestPeriod: this.interestPeriod
        });
    }
}


export default Account;
