import { db } from './config/firebase.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';

async function testFirestore() {
    console.log('--- Firestore Connection Test ---');
    try {
        // Test basic collection access
        const testColl = db.collection('test_connection');
        await testColl.add({ timestamp: new Date(), message: 'Connection test' });
        console.log('✅ Successfully wrote to test collection');

        // Test User Model
        const testUser = await User.create({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            phonenumber: '1234567890'
        });
        console.log('✅ Created test user:', testUser.id);

        const foundUser = await User.findById(testUser.id);
        console.log('✅ Found user by ID:', foundUser.email);

        const foundByEmail = await User.findByEmail('test@example.com');
        console.log('✅ Found user by email:', foundByEmail.name);

        // Test Invoice Model
        const testInvoice = await Invoice.create({
            user: testUser.id,
            invoiceNumber: 'INV-TEST-001',
            total: 1000,
            status: 'draft',
            billTo: { name: 'Client A' }
        });
        console.log('✅ Created test invoice:', testInvoice.id);

        const clientList = await Invoice.distinct('billTo.name', { user: testUser.id });
        console.log('✅ Distinct clients:', clientList);

        // Cleanup
        await db.collection('test_connection').doc(testColl.id).delete();
        await User.findByIdAndDelete(testUser.id);
        await Invoice.findByIdAndDelete(testInvoice.id);
        console.log('✅ Cleanup successful');

        console.log('\n--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Firestore Test Failed:', error);
        process.exit(1);
    }
}

testFirestore();
