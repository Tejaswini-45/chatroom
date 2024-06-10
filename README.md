# Chat Room System

This project is a robust chat room system built using JavaScript, Node.js, Express, and MySQL. The application ensures security, user authentication, and interactive communication.

## Features

1. **User Registration and Authentication**
   - Implemented using JWT.
   - Users provide userId, deviceId, name, phone, and availCoins for registration.

2. **Chat Room Creation**
   - Prime members can create chat rooms.
   - Endpoint: `POST /api/chatrooms`.
   - Chat room capacity is limited to 6 participants.

3. **Inviting Participants**
   - Chat room creators can invite other prime members using room ID and password.
   - Secure invitation mechanism using tokens.
   - Non-prime members can join one room for free, subsequent rooms require 150 coins.

4. **Joining a Room as a Non-Prime Member**
   - Endpoint: `POST /api/joinroom`.
   - Checks for prime membership and coin balance for additional room access.

5. **Chat Functionality**
   - Real-time messaging within chat rooms.
   - Implemented using WebSocket.
   - Endpoint: `POST /api/messages`.

6. **Profile Viewing**
   - Users can view each other's profiles.
   - Endpoint: `GET /api/profile/:userId`.

7. **Friend Requests**
   - Users can send friend requests to other participants.
   - Endpoint: `POST /api/friend-requests`.

8. **Database Management**
   - MySQL is used to store user details, chat room information, messages, and friend requests.
   - Proper database schema and queries implemented.

9. **Security Measures**
   - Secure password storage using bcrypt.
   - Prime members only can create chat rooms.
   - Sensitive information protection.

10. **Error Handling and Validation**
    - Robust error handling and input validation.
    - Appropriate response handling for errors (e.g., insufficient coins).

## Installation

### Prerequisites

- Node.js
- MySQL

### Steps

1. **Clone the Repository**

   ```sh
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name
