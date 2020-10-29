import Category from './Category.mjs';

class CategoryGroup {
    constructor(id) {
        this._id = id;

        this._name = null;
        this._notes = null;

        this._categories = [];
    }

    static fromSQL(record) {
        let grp = new CategoryGroup(record.id);

        grp._name = record.name;
        grp._notes = record.notes || null;

        return grp;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
    get notes() {
        return this._notes;
    }

    get categories() {
        return this._categories.slice();
    }


    /** check if this group includes a given category */
    hasCategory(cat) {
        if(!(cat instanceof Category)) {
            console.debug('%o is not a Category', cat);
        }
        return this._categories.includes(cat);
    }
    /** add a new category to this group */
    addCategory(cat) {
        if(!(cat instanceof Category)) {
            console.debug('%o is not a Category', cat);
            throw new TypeError('invalid argument');
        }
        if(this.hasCategory(cat)) {
            console.debug('Category %o was redundantly added to CategoryGroup %o', cat, this);
        }
        this._categories.push(cat);
    }
    /** remove a category from this group */
    removeCategory(cat) {
        if(!this.hasCategory(cat)) {
            console.debug('provided Category %o does not belong to this CategoryGroup %o', cat, this);
            throw new Error('invalid argument');
        }
        return this._categories.splice(this._categories.indexOf(cat), 1)[0];
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            notes: this.notes,
            tempId: this.tempId
        };
    }
}


export default CategoryGroup;
