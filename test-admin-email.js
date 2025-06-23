// Test script to send welcome email from admin panel
const testUser = {
  name: "John Doe",
  email: "mdjobayerarafat@gmail.com", // Using your verified email
  registrationId: "NCR-ADMIN-TEST-001"
};

fetch('http://localhost:3000/api/send-welcome-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: testUser.email,
    name: testUser.name,
    registrationId: testUser.registrationId,
  }),
})
.then(response => response.json())
.then(data => {
  console.log('✅ Admin email test result:', data);
})
.catch(error => {
  console.error('❌ Admin email test error:', error);
});
