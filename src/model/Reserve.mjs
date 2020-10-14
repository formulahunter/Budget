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
        rsv._opendate = record.opendate;
        rsv._closedate = record.closedate ? new Date(record.closedate) : null;
        rsv._notes = record.notes || null;

        return rsv;
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
}


export default Reserve;
