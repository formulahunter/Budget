class Source {

    constructor(id) {
        this._id = id;

        this._transaction = null;
        this._fund = null;
        this._category = null;

        this._amount = null;
        this._type = null;

        this._time = null;

        this._notes = null;
    }

    static fromSQL(record) {

        let src = new Source(record.id);

        src._transaction = record.transactionid;
        src._fund = record.fundid;
        if(record.categoryid) {
            src._category = record.categoryid;
        }

        src._amount = record.amount;
        src._type = record.type;          //  one of 'd' or 'c'

        if(record.time) {
            src._time = record.time;
        }

        if(record.notes) {
            src._notes = record.notes;
        }

        return src;
    }

    get id() {
        return this._id;
    }

    get transaction() {
        return this._transaction;
    }
    get fund() {
        return this._fund;
    }
    get category() {
        return this._category || null;
    }

    get amount() {
        return this._amount;
    }
    get type() {
        return this._type;
    }
    get netValue() {
        return this._type === 'c' ? this._amount : -1 * this._amount;
    }

    get notes() {
        return this._notes || null;
    }
}


export default Source;
