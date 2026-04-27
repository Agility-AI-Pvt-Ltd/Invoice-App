import { db } from '../config/firebase.js';

export class FirestoreModel {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.collection = db.collection(collectionName);
    }

    // Convert Firestore doc to Mongoose-like object (id instead of _id)
    _docToObj(doc) {
        if (!doc.exists) return null;
        return { id: doc.id, _id: doc.id, ...doc.data() };
    }

    async find(query = {}) {
        let ref = this.collection;
        
        Object.keys(query).forEach(key => {
            if (query[key] !== undefined) {
                // Handle nested fields like 'billTo.name'
                ref = ref.where(key, '==', query[key]);
            }
        });

        const snapshot = await ref.get();
        return snapshot.docs.map(doc => this._docToObj(doc));
    }

    async findById(id) {
        if (!id) return null;
        const doc = await this.collection.doc(id).get();
        return this._docToObj(doc);
    }

    async findOne(query = {}) {
        let ref = this.collection;
        
        Object.keys(query).forEach(key => {
            if (query[key] !== undefined) {
                ref = ref.where(key, '==', query[key]);
            }
        });

        const snapshot = await ref.limit(1).get();
        return snapshot.empty ? null : this._docToObj(snapshot.docs[0]);
    }

    async create(data) {
        // Remove _id if it exists to let Firestore generate one
        const { _id, ...cleanData } = data;
        const docRef = await this.collection.add({
            ...cleanData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const doc = await docRef.get();
        return this._docToObj(doc);
    }

    async findByIdAndUpdate(id, data, options = { new: true }) {
        if (!id) return null;
        const docRef = this.collection.doc(id);
        const { _id, ...cleanData } = data;
        await docRef.update({
            ...cleanData,
            updatedAt: new Date()
        });
        if (options.new) {
            return this.findById(id);
        }
        return null;
    }

    async findOneAndUpdate(query, data, options = { upsert: false, new: true }) {
        const existing = await this.findOne(query);
        if (existing) {
            return this.findByIdAndUpdate(existing.id, data, options);
        } else if (options.upsert) {
            return this.create({ ...query, ...data });
        }
        return null;
    }

    async findOneAndDelete(query) {
        const doc = await this.findOne(query);
        if (doc) {
            await this.collection.doc(doc.id).delete();
        }
        return doc;
    }

    async findByIdAndDelete(id) {
        const doc = await this.findById(id);
        if (doc) {
            await this.collection.doc(id).delete();
        }
        return doc;
    }

    // Mimic sort (very limited, requires indexes in Firestore)
    async findWithSort(query = {}, sortField = 'createdAt', direction = 'desc') {
        let ref = this.collection;
        Object.keys(query).forEach(key => {
            ref = ref.where(key, '==', query[key]);
        });
        ref = ref.orderBy(sortField, direction);
        const snapshot = await ref.get();
        return snapshot.docs.map(doc => this._docToObj(doc));
    }

    // Mimic distinct
    async distinct(field, query = {}) {
        const docs = await this.find(query);
        const values = docs.map(d => {
            // Handle nested fields like 'billTo.name'
            return field.split('.').reduce((obj, key) => obj && obj[key], d);
        });
        return [...new Set(values.filter(v => v !== undefined))];
    }
}
