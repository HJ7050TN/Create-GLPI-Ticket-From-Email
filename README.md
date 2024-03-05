# GLPIEmailHandler

GLPIEmailHandler is a Node.js application designed to automate ticket creation in GLPI from incoming emails, enhancing communication efficiency. It fetches unseen emails from your IMAP server, parses content, and generates corresponding tickets. With error handling, configurability, and modular code, it streamlines IT service request management.

## Installation

1. Clone the repository:

git clone https://github.com/HJ7050TN/GLPIEmailHandler

2. Install dependencies:

cd GLPIEmailHandler
npm install

## Usage

Once installed, you can run the application using npm:

npm start

To ensure uninterrupted operation, it's recommended to run the application continuously using a process manager like PM2:

1. Install PM2 globally (if not already installed):

npm install -g pm2

2. Start the application with PM2:

pm2 start ecosystem.config.js

The application will now run continuously, automatically restarting every 10 seconds according to the cron schedule specified in the configuration.

## Stopping the Application

To stop the application when using PM2, you can run:

pm2 stop glpi-email-handler

This will stop the application gracefully.

## Configuration

GLPIEmailHandler can be configured via environment variables. Create a `.env` file in the root directory and specify the required variables. Use the `.env.example` file as a template.

## Contributing

Contributions are welcome! If you'd like to contribute to GLPIEmailHandler, please fork the repository, make your changes, and submit a pull request. For major changes, please open an issue first to discuss the proposed changes.

## License

This project is licensed under the MIT License.
