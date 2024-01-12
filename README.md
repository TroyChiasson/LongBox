# ScrollRack Documentation

- [Introduction](#introduction)
- [longbox.js](#longboxjs)
  - [Express Server Setup](#express-server-setup)
  - [Server Start](#server-start)
  - [`validateCollectorNumber` Function](#validatecollectornumber-function)
  - [`addCard` Function](#addcard-function)
- [longbox.html](#longboxhtml)
  - [HTML Structure](#html-structure)
  - [Font Definition](#font-definition)
  - [Page Content](#page-content)
- [longbox.css](#longboxcss)
  - [Styling](#styling)
  - [Font Definition](#font-definition-css)
- [Card Recognition](#card-recognition)
- [Scryfall API](#scryfall-api)
- [Machine Design](#machine-design)
  - [Framework](#framework)
- [Arduino Controls](#arduino-controls)
    - [Libraries](#libraries)
    - [Controlling Motors](#controlling-motors)
- [Database Design](#database-design)
    - [Schema](#schema)


## Introduction

ScrollRack is a web application for organizing Magic: The Gathering cards.

## longbox.js

### Express Server Setup

In this part of the code, an Express.js server is configured to handle HTTP requests. It utilizes the `express` and `body-parser` libraries for creating and parsing requests.

### Server Start

This section initiates the Express server to listen on port 3000 for incoming requests. A console message confirms that the server is up and running.

### `validateCollectorNumber` Function

The `validateCollectorNumber` function validates the user's input for Collector's Number to ensure it contains only numeric characters. If the input is not valid, it displays an alert and clears the input field.

### `addCard` Function

The `addCard` function retrieves user inputs for Collector's Number, Card Name, Color, and Mana Cost from the form. It then dynamically creates a new table row for the card, populates it with the entered values, and appends it to the card list table. Lastly, it clears the input fields for the next entry.

## longbox.html

### HTML Structure

This part of the code defines the HTML structure of the web page. It includes the layout for adding new cards and displaying the card list. It also links to external CSS and JavaScript files.

### Font Definition

Defines a custom font named 'Magic' using the `@font-face` rule. This font is applied to the entire page.

### Page Content

Contains the main content of the web page, including the title, the form for adding cards, and the table for displaying the card list.

## longbox.css

### Styling

This section defines the CSS styles for the web page. It styles the body, headings, form elements, buttons, and table headers, giving the page a coherent and visually appealing design.

### Font Definition

Repeats the definition of the 'Magic' font using the `@font-face` rule. This ensures consistent font usage throughout the page.

## Card Recognition
Using Python and the openCV library, a camera is used to view the world in which a card is placed in its field of view.
There were difficulties finding good ways to implement the actual recognition of a card, so to this point (the first retro) the user can click a button when a card is in view and there is an attempt to scrape the text from the card that is visible. This information would then be parsed for useful text to be fed to the Scryfall API.

## Scryfall API

Using the API avaiable on Scryfall.com, we are able to search for cards by different characteristics.

Here is a search for a card by its exact name, Mana Crypt.

![image](https://github.com/TroyChiasson/LongBox/assets/45201515/d62c9bbb-e63d-42b4-9833-d58f77681988)

## Machine Design

### Framework
![Dashboard](backRear.PNG)
![Dashboard](rightFrontal.PNG)
![Dashboard](LeftFrontal.PNG)

## Arduino Controls

Arduino utilizes a type of C++ code and it comes with built in functions for sending info over usb to a seperate computer. You use `digitalRead` on the arduino and `Serial` on the computer to be able to send information via usb. Then having a start button and a loop to count scanned cards and you are able to control the arduino.

### Libraries

It is import to have `stepper.h` in the arduino control script to be able to use the motors.

### Controlling motors

We have to assign a `step` and `direction` that matches the pins on the arduino for each stepper motor we have plugged into it. Once these are set you need to initialize the motors being used with `stepper()`. Then in our loop for counting cards, every 5 cards we can move the stepper motor by declaring a `step` and direction. So each step will raise or lower the platforms.

## Database Design

### Schema




