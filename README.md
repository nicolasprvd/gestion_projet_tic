# Application de gestion des projets MIAGE

## Clone the project


    git clone https://github.com/nicolasprvd/gestion_projet_tic.git

## Run the application

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    ./mvnw
    npm start

## Building for production

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

    ./mvnw -Pprod clean verify --skipTests
