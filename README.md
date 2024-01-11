# ScrollRack Documentation

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

This documentation provides detailed descriptions of each code section and its components, making it easier to understand the purpose and functionality of the ScrollRack web application.
