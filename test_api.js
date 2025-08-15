const axios = require('axios');

const BASE_URL = 'https://invoice-backend-604217703209.asia-south1.run.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODQ1ZDI1NDM0MGMxMzZiNzg2NDkxMGIiLCJlbWFpbCI6InZAZ21haWwuY29tIn0.LxbUEei_L2Y522SrWDY5HDHhWQdYsSu9Ao5gwJ_e6Ro';

// Test 1: Change password from 'abc' to 'ABC'
async function testPasswordChange() {
  try {
    console.log('Testing password change...');
    const response = await axios.put(`${BASE_URL}/api/profile/password`, {
      currentPassword: 'abc',
      newPassword: 'ABC'
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Password change successful:', response.data);
  } catch (error) {
    console.error('❌ Password change failed:', error.response?.data || error.message);
  }
}

// Test 2: Update profile name to 'abhijit jha'
async function testProfileUpdate() {
  try {
    console.log('Testing profile update...');
    const response = await axios.put(`${BASE_URL}/api/profile`, {
      name: 'abhijit jha'
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful:', response.data);
  } catch (error) {
    console.error('❌ Profile update failed:', error.response?.data || error.message);
  }
}

// Test 3: Get current profile
async function testGetProfile() {
  try {
    console.log('Testing get profile...');
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ Get profile successful:', response.data);
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testGetProfile();
  console.log('');
  
  await testProfileUpdate();
  console.log('');
  
  await testPasswordChange();
  console.log('');
  
  console.log('🏁 All tests completed!');
}

runTests().catch(console.error); 