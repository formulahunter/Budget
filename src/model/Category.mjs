import Source from './Source.mjs';

class Category {

    constructor(id) {
        this._id = id;

        this._name = null;
        this._group = null;
        this._notes = null;

        this._sources = [];
    }

    static fromSQL(record) {

        let cat = new Category(record.id);

        cat._name = record.name;
        cat._group = record.groupid;
        cat._notes = record.notes || null;

        return cat;
    }

    static resolveRefs(cat, records) {
        if(typeof cat.group === 'number') {
            cat._group = records.categoryGroups.find(grp => grp.id === cat.group);
            if(!cat.group.hasCategory(cat)) {
                cat.group.addCategory(cat);
            }
        }
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
    get group() {
        return this._group;
    }
    get notes() {
        return this._notes || null;
    }

    get sources() {
        return this._sources.slice();
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

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            groupid: this.group?.id,
            notes: this.notes
        };
    }
}


export default Category;
