# evanesoteric.com

Evan Esoteric's matrix; enter at your own risk.

**[evanesoteric.com](https://evanesoteric.com)**

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) installed on your machine. This will include `npm`, which is necessary to install dependencies and run scripts defined in `package.json`.

### Installing

First, clone the repository to your local machine:

```
git clone https://github.com/evanesoteric/evanesoteric.com.git
```

Navigate to the project directory:

```
cd evanesoteric.com
```

Install the project dependencies:

```
npm install
```

### Running the Development Server

To start the development server, use the following command:

```
npm start
```

This command starts a local development server. It usually opens automatically in your default browser at `http://localhost:3000` (or another port if 3000 is in use). The development server will reload if you make edits to the source files. You will also see any lint errors in the console.

To start the develoment server without warning/error overlay:

```
npm run start:no-errors
```

### Building for Production

To compile and build the project for production, use:

```
npm run build
```

### Available Scripts

Check all JavaScript files for errors and potential bugs using ESLint.
```
npm run lint:js
```

Check all Sass/CSS files for style errors using Stylelint and automatically fixes many of them.

```
npm run lint:css
```

A convenient command that runs both lint:js and lint:css sequentially.

```
npm run lint
```
