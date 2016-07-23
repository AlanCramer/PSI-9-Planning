# printserver
Server-side generation of PDFs intended for printing

## Getting Started
- Ensure [`nvm`](https://github.com/creationix/nvm) is installed and up-to-date
  - `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash`
  - Verify with: `nvm --version` (Currently, v0.31.3)
- [Download and install the latest version of `node`](https://github.com/creationix/nvm#usage):
  - `nvm install node`
  - Verify with: `node --version` (Currently, latest is v6.3.1)
- [Update `npm`](https://docs.npmjs.com/getting-started/installing-node#updating-npm)
  - `npm install npm -g` 
  - Verify with: `npm --version` (Currently, v3.10.5)
- Install dependencies
  - First, ensure you are in the right directory - it should contain printserver's `package.json` file
  - `npm install`
- Start the server. Currently, it defaults to [`http://localhost:3000`](http://localhost:3000)
  - `npm start`

## Development
- Webpack TODO: Add more notes, Webpack is complicated...
- webpack-dev-server TODO: Add more notes

## Dependencies
- [Node.js](https://nodejs.org/dist/latest-v6.x/docs/api/)
- [Express](https://expressjs.com/en/4x/api.html)
- [Socket.io](http://socket.io/docs/)
- [phantomjs-node](https://github.com/amir20/phantomjs-node)
