class AbstractAccount {

    constructor(id) {
        this._id = id;

        this._name = null;
        this._balance = null;
        this._opendate = null;
        this._notes = null;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
    get balance() {
        return this._balance;
    }
    get opendate() {
        return this._opendate;
    }
    get notes() {
        return this._notes || null;
    }

}


export default AbstractAccount;
