import Source from './Source.mjs';

class Category {

    constructor(id) {
        this._id = id;

        this._name = null;
        this._opendate = null;
        this._notes = null;

        this._sources = [];
    }

    static fromSQL(record) {

        let cat = new Category(record.id);

        cat._name = record.name;
        cat._opendate = record.opendate;
        if(record.notes) {
            cat._notes = record.notes;
        }

        return cat;
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
    get notes() {
        return this._notes || null;
    }

    /** check if this category includes a given source */
    hasSource(src) {
        return this._sources.includes(src);
    }

    /** add a new source to this category */
    addSource(src) {
        if(!(src instanceof Source)) {
            throw new TypeError(`non-source instance ${src} added to category '${this.name}'`);
        }
        if(this._sources.indexOf(src) >= 0) {
            throw new Error(`duplicate source '${src}' added to category '${this.name}'`);
        }

        this._sources.push(src);
    }

    /** remove a source from this category */
    removeSrc(src) {
        if(this._sources.indexOf(src) < 0) {
            throw new Error(`cannot remove non-existent source ${src} from category '${this.name}'`);
        }

        return this._sources.splice(this._sources.indexOf(src), 1)[0];
    }
}


export default Category;
