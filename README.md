# Auto Roll Dice Daily

This script automates the daily dice rolling for quests on MagicNewton using user cookies. It checks if a user has already rolled the dice for the day and, if not, rolls the dice and logs the results. The script also calculates when the next run will occur based on the latest dice roll timestamps and reschedules the task dynamically.

Register : https://magicnewton.com/portal?referral=inyrkdj8wyyblaj6

## Features

- **Automatic Cookie Loading**: Load cookies from a `cookies.txt` file, one per line.
- **Quest Completion Check**: Verifies if a user has already rolled the dice for the day to avoid redundant actions.
- **Daily Dice Roll**: Rolls dice for the specified quest and logs the credits received.
- **Dynamic Scheduling**: Based on the timestamp of the latest dice roll, schedules the next run dynamically.
- **Error Logging**: Detailed error logging for any failed requests or issues during the dice roll process.
- **Console Output**: Clear and colorful console output using `chalk` for better visibility of process logs.

## Prerequisites

Before setting up this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (>=12.x)
- npm (comes with Node.js)
- `axios` for HTTP requests
- `chalk` for styled console output
- A `cookies.txt` file with your user cookies (one per line)

## Installation

### Clone the repository

```bash
git clone https://github.com/ganjsmoke/magic-dice.git
cd magic-dice
npm i
```

## Setup

1. **Prepare Cookies**:
   - Obtain your cookies and save them in a file named `cookies.txt` in the project root.
   - Each line in the `cookies.txt` should contain one valid cookie for a user account.
   - ![image](https://github.com/user-attachments/assets/347dcb00-2e0d-4eb1-8b19-0f6d1a0136d2)


2. **Modify Quest ID**:
   - If needed, you can modify the `questId` in the script to roll a different quest.

3. **Run the Script**:
   - You can start the script immediately using:
     ```bash
     node index.js
     ```

   This will initiate the dice roll process for all accounts specified in the `cookies.txt` file.

## How It Works

- **Loading Cookies**: The script reads cookies from `cookies.txt` and processes them one by one.
- **Rolling Dice**: For each account, the script checks if the dice have already been rolled for the current day. If not, it sends a POST request to roll the dice and logs the credits earned.
- **Scheduling the Next Run**: The script dynamically calculates when the next run should occur based on the latest dice roll timestamp and sets a timeout for the next execution.

## Logging

The script provides detailed logging for:
- Successful dice rolls and the credits received.
- Errors when rolling the dice or making requests.
- Information on when the script will rerun and how much time is left until the next execution.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



