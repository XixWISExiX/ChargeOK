# ChargeOK

Navigation System For EV Vehicles in Oklahoma

# Where is ChargeOK?

https://xixwisexix.github.io/ChargeOK/

# How work on ChargeOK

Before anything else you want to clone the repo from git, that is done through the following command

```
git clone https://github.com/XixWISExiX/ChargeOK.git
```

## Get Dependencies

### Application Dependencies

- Leaflet (display map) https://www.liedman.net/leaflet-routing-machine/#getting-started
- Mapbox (map logic with ev stations)
- NREL (ev station location api) https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/all/

### Technologies

- React.js (Frontend)
- Node.js (Backend)
- Firebase (Database)

In the charge-ok folder in your terminal, run the following commands in order

```
npm install yarn
```

```
yarn add axios firebase styled-components react-icons react-redux @reduxjs/toolkit react-router-dom
```

```
yarn add react-bootstrap bootstrap
yarn add @lottiefiles/react-lottie-player
yarn add netlify-lambda express serverless-http
yarn add leaflet react-leaflet
yard add leaflet-routing-machine
yarn add leaflet.locatecontrol
```

In the netlify-express folder, run the following commands in order

```
npm install cors
```

Next you want to have a .env file in the charge-ok folder so that you have access to the API KEYS (without this the app won't run) for more detail about the keys, please message "Joshua Wiseman".

## Run App

Open 2 terminal windows and run the commands in their respective directories in the same order

On the charge-ok/netlify-express directory, you will run

```
npm start
```

In the charge-ok directory, you will run

```
yarn start
```

To cancel running both of them, type ctrl+c

## Working with Git

Before any changes or tickets are worked on, you must first be on the main branch and pull from the repository.

```
git branch
```

(should point to main)

```
git pull
```

All recent changes added to the repository should now be on your system. With that you should now create a branch and switch to it.

```
git checkout -b issue-name
```

This command puts you in a branch specific to your issue so that you don't have to worry about changing the main branch.

If you want to swtich to other existing branches, run

```
git checkout issue-name
```

After you make sure that you are in your branch, you want to periodically upload your changes. You do this through uploading your changes to the cloud.

First add the changed files

```
git add .
```

To add changed files individually, you can run this instead

```
git add example1.js example2.js
```

Then commit your changes

```
git commit -m "description of changes"
```

Finally then you can push your changes

```
git push
```

After you publish some changes your code will not be immediatly pushed through, instead you must do something called a **Pull Request** or (PR). This must be done in order for random pushes not to go through and have all code be examined by a set of second eyes. For this use the github.com on this repo's web site (https://github.com/XixWISExiX/ChargeOK).

After your Pull Request is Submitted Joshua Wiseman will look at the code and merge it into the main branch of the repo. After this is done all main branches should then do a git pull to get all new changes.

This is done through

```
git checkout main
```

and

```
git pull
```

Then you repeat the process over again!

# Objectives

- Design an app that is user friendly for both tech and non-tech EV owners
- EV owners can use app to search/share/report nearby superchargers
  (charging fee/ availability/ etc.)
- EV owners can easily plan a trip using the app based on the given information
  of their vehicles and destinations
- Focusing solely on the usage of
  EVs in the state of Oklahoma.

# Log

## 09 26 2024

New git repo to let Josh manage conflicts and do code reviews.

## Aug 31 2024

Added Google API for routing, but planning to optimize on our own.

## Aug 29 2024

Built 2 React apps, 1 svelt app, 1 .NET app for Ticket 2
simple apps with HTML code embedded

## Aug 28 2024

Decided on using afdc API for station info
for Ticket2, we'll compare React, .Net, and Svelt for frontend

## Aug 23 2024

Ticket 1 Domain Understanding Presentation
about what we are getting into

## Aug 21 2024

Our priorities right now are

1. Getting ready for the presentation
2. Assigning roles (for Kanban and presentation)
3. Finish UI design

## Aug 19 2024

Discussed General plan for the project.
Might use React Native for frontend.
Not sure about backend.
Started designing barebone UI.
