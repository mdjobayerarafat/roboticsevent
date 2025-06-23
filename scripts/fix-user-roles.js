#!/usr/bin/env node

/**
 * User Role Diagnostic and Fix Tool
 * This script helps diagnose and fix user role permission issues
 * 
 * Usage: node scripts/fix-user-roles.js [command] [email]
 */

require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Users, Query } = require('node-appwrite');

// Initialize Appwrite client with admin credentials
const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

// Valid roles
const VALID_ROLES = ['user', 'admin', 'guest'];

async function normalizeRole(role) {
    if (!role || typeof role !== 'string') return 'user';
    
    const normalized = role.toLowerCase().trim();
    
    if (normalized === 'admin') return 'admin';
    if (normalized === 'user') return 'user';
    if (normalized === 'guest' || normalized === 'guests') return 'guest';
    
    // Default to user for any unrecognized role
    return 'user';
}

async function checkAndFixUserRoles(userEmail = null) {
    try {
        console.log('🔍 Checking user roles and permissions...\n');

        // Get all user profiles from database
        const userProfiles = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID
        );

        console.log(`Found ${userProfiles.total} user profiles in database\n`);

        let issuesFound = 0;
        let issuesFixed = 0;

        for (const profile of userProfiles.documents) {
            const currentRole = profile.role;
            const normalizedRole = await normalizeRole(currentRole);
            
            // Filter by email if specified
            if (userEmail && profile.email !== userEmail) {
                continue;
            }

            console.log(`User: ${profile.name} (${profile.email})`);
            console.log(`  Current role: '${currentRole}'`);
            console.log(`  Normalized role: '${normalizedRole}'`);

            // Check if role needs fixing (convert guests to user, keep guest as guest)
            const targetRole = (currentRole === 'guests') ? 'user' : normalizedRole;
            
            if (currentRole !== targetRole) {
                console.log(`  ⚠️  ISSUE: Role needs updating from '${currentRole}' to '${targetRole}'`);
                issuesFound++;

                try {
                    // Update the role
                    await databases.updateDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        profile.$id,
                        {
                            role: targetRole
                        }
                    );
                    console.log(`  ✅ Fixed: Updated role to '${targetRole}'`);
                    issuesFixed++;
                } catch (updateError) {
                    console.log(`  ❌ Failed to update role: ${updateError.message}`);
                }
            } else {
                console.log(`  ✅ Role is valid`);
            }

            console.log('');
        }

        console.log('📊 Summary:');
        console.log(`  Total profiles checked: ${userProfiles.total}`);
        console.log(`  Issues found: ${issuesFound}`);
        console.log(`  Issues fixed: ${issuesFixed}`);

        if (issuesFound === 0) {
            console.log('\n✅ All user roles are properly configured!');
        } else if (issuesFixed === issuesFound) {
            console.log('\n✅ All role issues have been fixed!');
        } else {
            console.log('\n⚠️  Some issues could not be fixed. Check permissions and try again.');
        }

    } catch (error) {
        console.error('❌ Error checking user roles:', error.message);
        
        if (error.message.includes('Missing scope')) {
            console.log('\n💡 Make sure you have set the APPWRITE_API_KEY in your .env.local file');
            console.log('   The API key needs "users.read" and "databases.write" permissions');
        }
    }
}

// Main execution
const command = process.argv[2];
const userEmail = process.argv[3];

if (command === 'check') {
    checkAndFixUserRoles(userEmail);
} else {
    console.log('🔧 User Role Diagnostic Tool\n');
    console.log('Usage:');
    console.log('  node scripts/fix-user-roles.js check [email]     - Check and fix role issues');
    console.log('\nExamples:');
    console.log('  node scripts/fix-user-roles.js check');    console.log('  node scripts/fix-user-roles.js check user@example.com');
}
