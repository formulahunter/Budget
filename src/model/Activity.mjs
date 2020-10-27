import Source from './Source.mjs';


class Activity {

    constructor(id) {
        this._id = id;

        this._title = null;
        this._time = null;
        this._notes = null;

        this._sources = [];
    }

    static fromSQL(record) {

        let act = new Activity(record.id);

        act._title = record.title;
        act._time = new Date(record.time);
        act._notes = record.notes || null;

        return act;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }
    get time() {
        return this._time;
    }
    get notes() {
        return this._notes;
    }

    get sources() {
        return this._sources.slice();
    }

    get sqlTime() {
        return this.time.toJSON().replace('T', ' ').substring(0, 23);
    }
    set sqlTime(dateStr) {

        let date = new Date();
        date.setUTCFullYear(Number(dateStr.substring(0, 4)));
        date.setUTCMonth(Number(dateStr.substring(5, 7)) - 1);
        date.setUTCDate(Number(dateStr.substring(8, 10)));
        date.setUTCHours(Number(dateStr.substring(11, 13)));
        date.setUTCMinutes(Number(dateStr.substring(14, 16)));
        date.setUTCSeconds(Number(dateStr.substring(17, 19)));
        date.setUTCMilliseconds(Number(dateStr.substring(20)));
        if(Number.isNaN(date.getTime())) {
            throw new Error(`invalid sql date ${dateStr}`);
        }

        this.time = date;
    }

    get grossValue() {
        let val = 0;
        for(let src of this._sources) {
            val += src.amount;
        }
        return val;
    }


    /** check if this activity includes a given source */
    hasSource(src) {
        if(!(src instanceof Source)) {
            console.debug('%o is not a Source', src);
        }
        return this._sources.includes(src);
    }
    /** add a new source to this activity */
    addSource(src) {
        if(!(src instanceof Source)) {
            console.debug('%o is not a Source', src);
            throw new TypeError('invalid argument');
        }
        if(this.hasSource(src)) {
            console.debug('Source %o was redundantly added to Activity %o', src, this);
        }
        this._sources.push(src);
    }
    /** remove a source from this activity */
    removeSrc(src) {
        if(!this.hasSource(src)) {
            console.debug('provided Source %o does not belong to this Activity %o', src, this);
            throw new Error('invalid argument');
        }
        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }
}



export default Activity;
