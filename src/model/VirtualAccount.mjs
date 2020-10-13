import AbstractAccount from './AbstractAccount.mjs';


class VirtualAccount extends AbstractAccount {

    constructor(id) {
        super(id);

        this._realAccount = null;
        this._funds = [];
    }

    static fromSQL(record) {

        const va = new VirtualAccount(record.id);

        va._name = record.name;
        va._balance = Number(record.balance);
        va._opendate = new Date(record.opendate);
        va._notes = record.notes;

        va._realAccount = record._realid;
    }

    get realAccount() {
        return this._realAccount;
    }
}


export default VirtualAccount;
