const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');  // Import chalk for better logging

// Load cookies from the cookies.txt file, trimming whitespace from each cookie line
const loadCookies = () => {
  return fs.readFileSync(path.resolve(__dirname, 'cookies.txt'), 'utf8')
    .split('\n') // Split the file content by newlines
    .map(cookie => cookie.trim()) // Trim whitespace from each cookie line
    .filter(cookie => cookie.length > 0); // Remove any empty lines
};

// Helper function to check if a date is today in UTC
const isToday = (date) => {
  const today = new Date();
  // Get today's date in UTC (year, month, date)
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  // Set the time of the passed date to midnight UTC
  const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  
  return dateUTC.getTime() === todayUTC.getTime(); // Compare if the date matches today's date (ignoring the time)
};

// Check if the user has already rolled the dice for the quest on today's date
const hasRolledDice = async (cookies) => {
  const url = 'https://www.magicnewton.com/portal/api/userQuests';

  try {
    const response = await axios.get(url, {
      headers: {
        'Cookie': cookies, // Pass the specific cookie for the account
        'Content-Type': 'application/json'
      }
    });

    // Filter for the specific questId and check if it was rolled today
    const questId = 'f56c760b-2186-40cb-9cbc-3af4a3dc20e2';
    const questCompletedToday = response.data.data.some(quest => 
      quest.questId === questId && 
      quest.status === 'COMPLETED' &&
      isToday(new Date(quest.createdAt)) // Check if createdAt is today's date in UTC
    );

    return questCompletedToday; // Return true if the quest is already completed today for this user
  } catch (error) {
    console.error(chalk.red('Error while checking if user has rolled dice:', error.message));
    return false; // Return false if there's an error
  }
};

// Roll dice function for each account
const rollDice = async (cookies, index) => {
  const questId = 'f56c760b-2186-40cb-9cbc-3af4a3dc20e2';

  // First check if the user has already rolled the dice today
  const alreadyRolled = await hasRolledDice(cookies);

  if (alreadyRolled) {
    console.log(chalk.yellow(`Account #${index + 1} has already rolled the dice today, skipping.`));
    return;
  }

  const url = 'https://www.magicnewton.com/portal/api/userQuests';
  const payload = {
    questId: questId,
    metadata: {}
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Cookie': cookies, // Pass the specific cookie for the account
        'Content-Type': 'application/json'
      }
    });

    // Check if the quest is completed and print the credits received
    if (response.data.message === "Quest completed") {
      const creditsReceived = response.data.data.credits;
      console.log(chalk.green(`Quest completed for account #${index + 1}, Credits received: ${creditsReceived}`));
    } else {
      console.log(chalk.red('Error for account #', index + 1));
      console.log(chalk.red('Error message:', response.data.message));
    }
  } catch (error) {
    // Log detailed error response if request fails
    if (error.response) {
      console.error(chalk.red('Error response status for account #', index + 1, ':', error.response.status));
      console.error(chalk.red('Error response data:', error.response.data));
    } else {
      console.error(chalk.red('Error message for account #', index + 1, ':', error.message));
    }
  }
};

// Function to calculate the difference between now and next run time
const calculateNextRunTime = (latestCreatedAt) => {
  const nextRunTime = new Date(latestCreatedAt);
  nextRunTime.setHours(nextRunTime.getHours() + 24); // Add 24 hours
  nextRunTime.setMinutes(nextRunTime.getMinutes() + 5); // Add 5 minutes

  const now = new Date();
  const timeDifference = nextRunTime - now; // Calculate the difference between now and next run time

  return { timeDifference, nextRunTime };
};

// Load all cookies (one per line represents an account)
const cookiesList = loadCookies();

// First run for each account immediately
cookiesList.forEach((cookies, index) => rollDice(cookies, index));

// After all dice rolls, request the latest `createdAt` from all cookies
const getLatestCreatedAt = async () => {
  const createdAtList = [];

  for (let index = 0; index < cookiesList.length; index++) {
    const cookies = cookiesList[index];
    const url = 'https://www.magicnewton.com/portal/api/userQuests';

    try {
      const response = await axios.get(url, {
        headers: {
          'Cookie': cookies,
          'Content-Type': 'application/json'
        }
      });

      // Filter for the most recent data by questId and get the latest createdAt timestamp
      const latestQuest = response.data.data.filter(quest => quest.questId === 'f56c760b-2186-40cb-9cbc-3af4a3dc20e2')
                                             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]; // Sort by createdAt, descending

      if (latestQuest) {
        createdAtList.push(new Date(latestQuest.createdAt)); // Collect the most recent `createdAt`
      }
    } catch (error) {
      console.error(chalk.red(`Error fetching data for account #${index + 1}:`, error.message));
    }
  }

  if (createdAtList.length > 0) {
    // Sort the list of timestamps in descending order (latest first)
    const sortedCreatedAtList = createdAtList.sort((a, b) => b - a);

    // Find the latest `createdAt` date from all the accounts
    const latestCreatedAt = sortedCreatedAtList[0];
    const { timeDifference, nextRunTime } = calculateNextRunTime(latestCreatedAt);

    // Show only integer value for minutes
    const minutes = Math.round(timeDifference / 1000 / 60); // Convert milliseconds to minutes

    console.log(chalk.blue(`The next run will be scheduled for ${nextRunTime}.`));
    console.log(chalk.blue(`The script will rerun in ${minutes} minutes.`));

    // Set the next interval dynamically based on time difference
    setTimeout(async () => {
      await processAllAccounts();
    }, timeDifference);
  }
};
function printHeader() {
    const line = "=".repeat(50);
    const title = "Auto Roll Dice Daily";
    const createdBy = "Bot created by: https://t.me/airdropwithmeh";

    const totalWidth = 50;
    const titlePadding = Math.floor((totalWidth - title.length) / 2);
    const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

    const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
    const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

    console.log(chalk.cyan.bold(line));
    console.log(chalk.cyan.bold(centeredTitle));
    console.log(chalk.green(centeredCreatedBy));
    console.log(chalk.cyan.bold(line));
}

printHeader();
// Log the time when the script will rerun after completing all dice rolls
getLatestCreatedAt();

// Sequentially process all accounts (awaiting completion of each dice roll)
const processAllAccounts = async () => {
  for (let index = 0; index < cookiesList.length; index++) {
    await rollDice(cookiesList[index], index); // Wait for each dice roll to finish before proceeding
  }

  // After all dice rolls, request the latest `createdAt` from all cookies
  await getLatestCreatedAt();
};
