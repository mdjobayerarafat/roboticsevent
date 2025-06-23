/**
 * Simple login test and role validation
 * Use this in browser console to test login
 */

// Simple test function to validate login
async function testLogin(email, password) {
    console.log('🔧 Testing login...\n');
    
    try {
        // Test using the global Appwrite client
        console.log('1️⃣ Testing connection...');
        
        // Clear any existing session first
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            console.log('Cleared existing session');
        } catch (e) {
            console.log('No existing session to clear');
        }
        
        // Test direct login
        console.log('2️⃣ Testing login...');
        
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (loginResponse.ok) {
            const result = await loginResponse.json();
            console.log('✅ Login successful:', result);
            console.log('✅ User role:', result.user?.role);
            console.log('✅ You should now be able to access the application');
        } else {
            const error = await loginResponse.json();
            console.error('❌ Login failed:', error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        console.log('\n💡 Try these manual steps:');
        console.log('1. Clear browser storage (DevTools > Application > Clear Storage)');
        console.log('2. Refresh the page');
        console.log('3. Try logging in again');
    }
}

// Make function available globally
window.testLogin = testLogin;

console.log('� Simple login test loaded!');
console.log('Usage: testLogin("your-email", "your-password")');

// Quick role fix function
async function fixUserRole(userId, newRole = 'user') {
    try {
        const { databases, DATABASE_ID, USERS_COLLECTION_ID } = await import('/lib/appwrite.js');
        
        const result = await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { role: newRole }
        );
        
        console.log('✅ Role updated successfully:', result.role);
        return result;
    } catch (error) {
        console.error('❌ Failed to update role:', error.message);
        throw error;
    }
}

// Export functions for console use
window.testLogin = testLogin;
window.fixUserRole = fixUserRole;

console.log('🔧 Login diagnostic tools loaded!');
console.log('Usage:');
console.log('  testLogin("your-email@example.com", "your-password")');
console.log('  fixUserRole("user-id", "user") // or "admin"');
console.log('');
console.log('Test with your credentials:');
console.log('  testLogin("jobayerarafatonline@gmail.com", "your-password")');
