#!/usr/bin/env node

/**
 * Script to diagnose and fix authentication issues
 * This script helps resolve "User (role: guests) missing scope (account)" errors
 * 
 * Usage: node scripts/fix-auth-issues.js [email]
 */

require('dotenv').config({ path: '.env.local' });
const { Client, Account, Databases, Users, Query } = require('node-appwrite');

// Initialize Appwrite client with admin credentials
const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY || 'your-api-key-here'); // You'll need to set this

const account = new Account(client);
const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

async function fixAuthIssues(userEmail = null) {
    try {
        console.log('🔍 Diagnosing authentication issues...\n');

        // List all users if no specific email provided
        if (!userEmail) {
            console.log('📋 Listing all users with potential issues:');
            
            try {
                const usersList = await users.list();
                console.log(`Found ${usersList.total} total users\n`);
                
                for (const user of usersList.users) {
                    console.log(`User: ${user.name} (${user.email})`);
                    console.log(`  ID: ${user.$id}`);
                    console.log(`  Status: ${user.status ? 'Active' : 'Inactive'}`);
                    console.log(`  Email Verified: ${user.emailVerification}`);
                    
                    // Check if user has profile in database
                    try {
                        const profile = await databases.getDocument(
                            DATABASE_ID,
                            USERS_COLLECTION_ID,
                            user.$id
                        );
                        console.log(`  Profile Role: ${profile.role}`);
                        
                        if (profile.role === 'guests' || !profile.role) {
                            console.log(`  ⚠️  ISSUE: User has 'guests' role or no role`);
                        }
                    } catch (profileError) {
                        console.log(`  ❌ ISSUE: No profile found in database`);
                    }
                    console.log('');
                }
                
                console.log('\n💡 To fix issues for a specific user, run:');
                console.log('node scripts/fix-auth-issues.js user@example.com\n');
                return;
            } catch (error) {
                console.error('❌ Error listing users:', error.message);
                return;
            }
        }

        // Fix issues for specific user
        console.log(`🔧 Fixing authentication issues for: ${userEmail}\n`);
        
        // Find user by email
        let targetUser;
        try {
            const usersList = await users.list([Query.equal('email', userEmail)]);
            if (usersList.users.length === 0) {
                console.log('❌ User not found');
                return;
            }
            targetUser = usersList.users[0];
            console.log(`✅ Found user: ${targetUser.name} (${targetUser.$id})`);
        } catch (error) {
            console.error('❌ Error finding user:', error.message);
            return;
        }

        // Check and fix user profile
        try {
            console.log('🔍 Checking user profile in database...');
            
            let profile;
            try {
                profile = await databases.getDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    targetUser.$id
                );
                console.log(`✅ Profile found with role: ${profile.role}`);
            } catch (profileError) {
                if (profileError.type === 'document_not_found') {
                    console.log('⚠️  Profile not found, creating new profile...');
                    
                    profile = await databases.createDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        targetUser.$id,
                        {
                            name: targetUser.name,
                            email: targetUser.email,
                            role: 'user',
                            isVerified: targetUser.emailVerification,
                            $id: targetUser.$id,
                            studentIdFileId: '',
                            paymentScreenshotFileId: ''
                        }
                    );
                    console.log('✅ Created new profile with user role');
                } else {
                    throw profileError;
                }
            }

            // Fix role if needed
            if (profile.role === 'guests' || !profile.role) {
                console.log('🔧 Fixing user role from guests to user...');
                
                const updatedProfile = await databases.updateDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    targetUser.$id,
                    {
                        role: 'user'
                    }
                );
                console.log('✅ Updated user role to: user');
            }

            // Verify user status
            if (!targetUser.status) {
                console.log('⚠️  User account is inactive');
                // Note: You might need additional permissions to update user status
            }

            if (!targetUser.emailVerification) {
                console.log('⚠️  User email is not verified');
                console.log('💡 Consider updating verification status if needed');
            }

        } catch (error) {
            console.error('❌ Error fixing user profile:', error.message);
            return;
        }

        console.log('\n✅ Authentication issues fixed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   User: ${targetUser.name} (${targetUser.email})`);
        console.log(`   Role: user`);
        console.log(`   Status: ${targetUser.status ? 'Active' : 'Inactive'}`);
        console.log(`   Email Verified: ${targetUser.emailVerification}`);
        
        console.log('\n💡 The user should now be able to log in without permission errors.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

async function clearAllSessions() {
    try {
        console.log('🧹 Clearing all active sessions...');
        
        // This would require admin privileges to clear all sessions
        console.log('⚠️  Note: Session clearing requires server-side implementation');
        console.log('💡 Users can clear their own sessions by logging out and back in');
        
    } catch (error) {
        console.error('❌ Error clearing sessions:', error.message);
    }
}

// Main execution
const command = process.argv[2];
const userEmail = process.argv[3];

if (command === 'clear-sessions') {
    clearAllSessions();
} else if (command && command !== 'list') {
    // If first argument is an email, treat it as user email
    fixAuthIssues(command);
} else {
    // Default: list all users
    fixAuthIssues();
}
