/*
 * =========================================================================
 * 9gag Account Blocker
 * =========================================================================
 * 
 * Author: benji1000
 * Version: 1.0
 * Last Updated: May 31, 2025
 * 
 * Description:
 * Automatically blocks a list of accounts on 9gag.com by fetching
 * their account IDs and sending block requests via the 9gag API.
 * 
 * Usage:
 * 1. Edit the 'usersToBlock' variable with comma-separated usernames
 * 2. Run this script in the browser console while logged into 9gag.com
 * 3. Execute blockAllUsers() to start the blocking process
 * 4. Optionnaly run getBlockedUsers() to get the list of blocked accounts.
 * 
 * Initial list of bot accounts from https://9gag.com/gag/avyR32n
 * with the removal of two inexisting accounts.
 * 
 * =========================================================================
 */

const usersToBlock = "dafuqman,windoge81,humor_god,the_snapp,gamingbirb,randomguy67,moviecoww,dumbsandwich,catlicking,cheesy_fries,fernandelr,matrix00,catcheeee,happysaddd,sadfrong,summonar,donkeywong";
const requestsDelay = 1000;

function parseUsersList(usersList) {
    return usersList.split(',').map(user => user.trim()).filter(user => user.length > 0);
}

async function getAccountId(username) {
    try {        
        const response = await fetch(`https://9gag.com/u/${username}`);
        
        if (response.status === 404) {
            console.log(`⚠️ Account with username ${username} doesn't exist.`);
            return "USER_NOT_FOUND";
        }
        
        const html = await response.text();
        const accountIdMatch = html.match(/\\"accountId\\":\\"(\d+)\\"/);
        
        if (accountIdMatch && accountIdMatch[1]) {
            return accountIdMatch[1];
        } else {
            throw new Error(`Couldn't find the accountId for user ${username}`);
        }
        
    } catch (error) {
        console.error(`Failed to get the accountId for user ${username}:`, error);
        return null;
    }
}

async function blockUser(username, accountId) {
    try {
        const formData = new FormData();
        formData.append('accountId', accountId);
        formData.append('_method', 'post');
        
        const response = await fetch('https://9gag.com/v1/user-block', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`❌ Blocking request for account ${username} (${accountId}) failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.meta && result.meta.status === 'Success') {
            console.log(`✅ Account ${username} (${accountId}) successfully blocked!`);
            return true;
        } else {
            console.error(`❌ Account ${username} (${accountId}) could not be blocked:`, result);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Failed to block account ${username} (${accountId}):`, error);
        return false;
    }
}

async function getBlockedUsers(start = 0, blockedUsers = false) {
    try {
        if(start == 0){
            console.log(`ℹ️ This function will run in several rounds if you've blocked a lot of accounts, please stand by.`);
        }
        console.log(`📋 Fetching blocked accounts (round ${(start/50)+1})...`);

        const formData = new FormData();
        formData.append('fromIndex', start);
        formData.append('itemCount', 50);
        
        const response = await fetch('https://9gag.com/v1/user-block-list', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.meta && result.meta.status === 'Success' && result.data) {
            let thisRoundBlockedUsers = result.data.users.map(user => user.username);
            if(blockedUsers) {
                blockedUsers += thisRoundBlockedUsers;
            }
            else {
                blockedUsers = thisRoundBlockedUsers;
            }

            /*
            * The API can only return 50 blocked accounts at a time,
            * so the function calls itself recursively to fetch the rest
            * until the API says the end of list was reached.
            */
            if(result.data.didEndOfList == 0) {
                await new Promise(resolve => setTimeout(resolve, requestsDelay));
                getBlockedUsers(start + 50, blockedUsers);
            }
            else {
                var uniqueAndSorted = [...new Set(blockedUsers.split(','))].sort();
                console.log(`✅ Found ${uniqueAndSorted.length} blocked users:`, uniqueAndSorted.toString());
                return uniqueAndSorted;
            }
        } else {
            console.error('❌ Failed to fetch blocked users:', result);
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error fetching blocked users:', error);
        return [];
    }
}

async function blockAllUsers() {
    console.log('🚀 Process start...');
    
    const usersList = parseUsersList(usersToBlock);
    
    if (usersList.length === 0) {
        console.log('❌ Please correctly fill the usersToBlock variable at the start of the script.');
        return;
    }
    
    console.log(`📝 ${usersList.length} account(s) to block:`, usersList);
    
    let successCount = 0;
    let failureCount = 0;
    let failureList = new Array();
    let notFoundCount = 0;
    let notFoundList = new Array();
    
    for (const user of usersList) {
        try {
            const accountId = await getAccountId(user);
            
            if (accountId === "USER_NOT_FOUND") {
                notFoundCount++;
                notFoundList.push(user);
            } else if (accountId) {
                const success = await blockUser(user, accountId);
                
                if (success) {
                    successCount++;
                } else {
                    failureCount++;
                    failureList.push(user);
                }
            } else {
                failureCount++;
                failureList.push(user);
            }
            
            await new Promise(resolve => setTimeout(resolve, requestsDelay));
            
        } catch (error) {
            console.error(`❌ Something went wrong during processing of the account ${user}:`, error);
            failureCount++;
            failureList.push(user);
        }
    }
    
    console.log(`\nSCRIPT EXECUTION SUMMARY`);
    console.log(`✅ ${successCount} account(s) blocked.`);
    if(notFoundCount > 0) {console.log(`⚠️ ${notFoundCount} account(s) not found: ${notFoundList.toString()}.`);}
    if(failureCount > 0) {console.log(`❌ ${failureCount} fail(s): ${failureList.toString()}.`);}
    console.log('🏁 Processus over.');
}