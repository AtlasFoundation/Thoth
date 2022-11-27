# THOTH

Thoth is a multishot system builder. It leverages a visual coding style interface to allows game designers and developers to rapidly create powerful natural language systems and prototype games.

## Quickstart

You will need **yarn or npm** and **Docker** installed, along with **Node.js 16 or higher**. We use Docker to run a local Postgres database. You can skip the docker and install postgres directly, but you are almost always better off just using Docker.
For **Linux** and **MAC** users, **sleep** and **concurently** commands must be installed in the machine.

Install xvfb, chromium and ffmpeg

First, clone and set up Thoth

```
git clone https://github.com/TheNexusCity/thoth
```

Next, install dependencies

```
yarn install
OR
npm i
```

You will need to make a few environment variable modifications
To keep values privates, create a new file for each .env, called .env.local (these files are safe from the .gitignore)

In order to run the client and server use

```
yarn run dev

If on Windows run:
yarn run dev:windows
```

### Local Development

We use dotenv-flow for local environment variable management

Go to client folder, and create a new file called .env.local -- copy and .env vars you want to set from .env there

Go to server folder, and create a new file called .env.local -- copy and .env vars you want to set from .env there

## Client Setup

1. Clone the repository
1. Navigate to the project root by running `cd thoth`
1. Run `yarn install` to install project dependencies
1. Run `yarn start` to start the @thothai/thoth-client app

## Core Local Setup

1. Core the contents of `core/.env.default` to `core/.env` and modify the secrets as necessary
1. Step 2 in Monorepo Development Setup

## Available Scripts

In the project directory, you can run:

### `yarn run dev`

Runs both server and client.\
Open [https://localhost:3001](https://localhost:3001) to view it in the browser.

### `yarn start`

Runs @thothai/client in the development mode.\
Open [http://localhost:3003](http://localhost:3003) to view it in the browser.

### `yarn build`

Builds the @thothai/thoth-client app for production to the `client/build` folder.

### `yarn build:core`

Builds the @thothai/core package for production to the `core/build` folder.

## Apache license information

Good example here for formatting apache license files for reference.
https://www.openntf.org/Internal/home.nsf/dx/Applying_Apache_License
