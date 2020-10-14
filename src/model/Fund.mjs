import Source from './Source.mjs';
import Reserve from './Reserve.mjs';

class Fund {

    constructor(id) {
        this._id = id;

        this._name = null;
        this._opendate = null;
        this._closedate= null;
        this._notes = null;

        this._reserves = [];
        this._sources = [];
    }

    static fromSQL(record) {
        let fund = new Fund(record.id);

        fund._name = record.name;
        fund._opendate = record.opendate;
        fund._closedate = record.closedate ? new Date(record.closedate) : null;
        fund._notes = record.notes || null;

        return fund;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
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

    get reserves() {
        return this._reserves.slice();
    }
    get sources() {
        return this._sources.slice();
    }

    get balance() {
        let balance = 0;
        for(let rsv of this._reserves) {
            balance += rsv.amount;
        }
        return balance;
    }


    /** check if this fund includes a given reserve */
    hasReserve(rsv) {
        if(!(rsv instanceof Reserve)) {
            console.debug('%o is not a Reserve', rsv);
        }
        return this._reserves.includes(rsv);
    }
    /** add a new reserve to this fund */
    addReserve(rsv) {
        if(!(rsv instanceof Reserve)) {
            console.debug('%o is not a Reserve', rsv);
            throw new TypeError('invalid argument');
        }
        if(this.hasReserve(rsv)) {
            console.debug('Reserve %o was redundantly added to Fund %o', rsv, this);
        }

        this._reserves.push(rsv);
    }
    /** remove a reserve from this fund */
    removeReserve(rsv) {
        if(!this.hasReserve(rsv)) {
            console.debug('provided Reserve %o does not belong to this Fund %o', rsv, this);
            throw new Error('invalid argument');
        }

        return this._reserves.splice(this._reserves.indexOf(rsv), 1)[0];
    }

    /** check if this fund includes a given source */
    hasSource(src) {
        return this._sources.includes(src);
    }
    /** add a new source to this fund */
    addSource(src) {
        if(!(src instanceof Source)) {
            throw new TypeError(`non-source instance ${src} added to fund '${this.name}'`);
        }
        if(this._sources.indexOf(src) >= 0) {
            throw new Error(`duplicate source '${src}' added to fund '${this.name}'`);
        }

        this._sources.push(src);
    }
    /** remove a source from this fund */
    removeSrc(src) {
        if(this._sources.indexOf(src) < 0) {
            throw new Error(`cannot remove non-existent source ${src} from fund '${this.name}'`);
        }

        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }

}


export default Fund;
