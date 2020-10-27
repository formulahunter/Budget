import { dateToSQLString, sqlStringToDate } from '../util/utils.js';

class Reserve {

    constructor(id) {
        this._id = id;

        this._account = null;
        this._fund = null;
        this._amount = null;
        this._opendate = null;
        this._closedate = null;
        this._notes = null;
    }

    static fromSQL(record) {
        const rsv = new Reserve(record.id);

        rsv._account = record.accountid;
        rsv._fund = record.fundid;
        rsv._amount = record.amount;
        rsv._opendate = sqlStringToDate(record.opendate);
        rsv._closedate = record.closedate ? sqlStringToDate(record.closedate) : null;
        rsv._notes = record.notes || null;

        return rsv;
    }

    static resolveRefs(rsv, records) {
        if(typeof rsv.account === 'number') {
            rsv._account = records.accounts.find(acct => acct.id === rsv.account);
            if(!rsv.account.hasReserve(rsv)) {
                rsv.account.addReserve(rsv);
            }
        }
        if(typeof rsv.fund === 'number') {
            rsv._fund = records.funds.find(fnd => fnd.id === rsv.fund);
            if(!rsv.fund.hasReserve(rsv)) {
                rsv.fund.addReserve(rsv);
            }
        }
    }

    get id() {
        return this._id;
    }

    get account() {
        return this._account;
    }
    get fund() {
        return this._fund;
    }
    get amount() {
        return this._amount;
    }
    get opendate() {
        return this._opendate;
    }
    get closedate() {
        return this._closedate;
    }
    get notes() {
        return this._notes;
    }

    get sqlOpendate() {
        return dateToSQLString(this._opendate);
    }
    get sqlClosedate() {
        return this._closedate ? dateToSQLString(this._opendate) : null;
    }

    toJSON() {
        return {
            id: this.id,
            accountid: this.account.id,
            fundid: this.fund.id,
            amount: this.amount,
            openDate: this.sqlOpendate,
            closedate: this.sqlClosedate,
            notes: this.notes
        };
    }
}


export default Reserve;
