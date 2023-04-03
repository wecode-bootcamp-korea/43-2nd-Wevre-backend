class ItemQueryBuilder {
    constructor(limit = '', offset = '', category = '', sorting = 'id', authorName = '', itemName = '') {
        this.limit = limit;
        this.offset = offset;
        this.category = category;
        this.sorting = sorting;
        this.authorName = authorName;
        this.itemName = itemName;
    }

    isShowBuilder(){
        const IS_SHOW = Object.freeze({
            true: 1,
            false: 0
        })
        return `WHERE is_show = ${IS_SHOW["false"]}`
    }

    categoryIdBuilder() {
        const CATEGORY_ID = Object.freeze({
            "공예": 1,
            "회화": 2,
            "사진": 3,
            "조각": 4
        });
        if (this.category) {
            return `AND categories.id = ${CATEGORY_ID[this.category]}`
        }
    }

    authorNameBuilder() {
        console.log("author", this.authorName)
        if (this.authorName) {
            return `AND author_name = "${this.authorName}"`
        }
    }

    itemNameBuilder() {
        if (this.itemName) {
            return `AND item_name = "${this.itemName}"`
        }
    }

    sortingBuilder() {
        const SORTING = Object.freeze({
            "author": "ORDER BY author_name ASC",
            "price": "ORDER BY starting_bid ASC",
            "-price": "ORDER BY starting_bid DESC",
            "productionYear": "ORDER BY production_year ASC",
            "id": "ORDER BY id ASC"
        });
        if (this.sorting) {
            return SORTING[this.sorting]
        }
        return SORTING["id"]
    }

    limitBuilder() {
        if (this.limit) {
            return `LIMIT ${this.limit}`;
        }
    }

    offsetBuilder() {
        if (this.offset) {
            return `OFFSET ${this.offset}`
        }
    }

    build() {
        const filterQuery = [
            this.isShowBuilder(),
            this.categoryIdBuilder(),
            this.authorNameBuilder(),
            this.itemNameBuilder(),
            this.sortingBuilder(),
            this.limitBuilder(),
            this.offsetBuilder(),
        ]
        return filterQuery.join(' ')
    }
}

module.exports = {ItemQueryBuilder};

