// Script to set a user as admin in Appwrite
// Run this in your browser console while logged into the admin panel

const setUserAsAdmin = async (userEmail) => {
  try {
    console.log(`Setting user ${userEmail} as admin...`);
    
    // First, get the databases instance
    const { databases, DATABASE_ID, USERS_COLLECTION_ID } = window;
    
    if (!databases || !DATABASE_ID || !USERS_COLLECTION_ID) {
      console.error('Appwrite is not properly initialized. Make sure you are on the admin page.');
      return;
    }
    
    // Query for the user by email
    const userQuery = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.equal("email", userEmail)
      ]
    );
    
    if (userQuery.documents.length === 0) {
      console.error('User not found with email:', userEmail);
      return;
    }
    
    const user = userQuery.documents[0];
    console.log('Found user:', user.name, user.email);
    
    // Update the user's role to admin
    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        role: 'admin'
      }
    );
    
    console.log('✅ Successfully updated user role to admin!');
    console.log('User details:', {
      id: updatedUser.$id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
    
    return updatedUser;
    
  } catch (error) {
    console.error('❌ Error setting user as admin:', error);
    throw error;
  }
};

// Usage example:
// setUserAsAdmin('user@example.com')

// Export for manual use
if (typeof window !== 'undefined') {
  window.setUserAsAdmin = setUserAsAdmin;
  console.log('🔧 Admin utility loaded! Use: setUserAsAdmin("user@example.com")');
}

module.exports = { setUserAsAdmin };
