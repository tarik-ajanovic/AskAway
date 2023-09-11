# AskAway - A Slido-Inspired Web App

## Description
AskAway is a Q&A moderation platform inspired by Slido.com. This project was a part of my university course Selected Topics in Computer Science.
This is a full web app with a frontend, backend, and database. The main concept is that a host can host virtual Q&A sessions where the attendees can ask questions
that the host can then answer in real life. This web app could be used in public Q&As, university lectures, or conventions.

## Structure & Modules
The web app has 3 modules. These modules and their requirements were provided by the course professor.
### Admin Module
- A superuser account has control of all user input
- Has control of all CRUD operations of the system
- Can change user data, asked questions, and edit the forbidden word list of a user
### User Module
- A person with a created account on the platform is the Q&A host
- User can create and schedule events
- Has an overview of all of the asked questions which they can mark as answered or hide them
- Has a systematic view of previous and future Q&A events through the user dashboard
- Can edit and update the forbidden word list for asked questions
- Can share the Q&A virtual room via a unique event code
### Guest
- A person who doesn't have an account is called the guest user
- These are the event attendees who can ask questions for the event hosts to answer
- Can like others' questions which get sorted so that the lecturer can notice the question with the most likes
- Can attend events by entering the unique event code provided by the host

## Tech Stack
- Express.js
- Vanilla HTML
- Bootstrap
- Node.js
- PostgreSQL
