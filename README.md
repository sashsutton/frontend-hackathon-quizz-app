# Frontend for AMU Hackathon 2026 Quiz App

## Overview
This frontend provides a user interface for the quiz application designed to strengthen cohesion among computer science students at Aix-Marseille University. It interacts with the backend to facilitate quiz-based interactions between undergraduate and graduate students.

**Backend Repository**: [backend-hackathon-web-app-2](https://github.com/sashsutton/backend-hackathon-web-app-2)

## Features
- User authentication
- Quiz creation and participation
- Duel mode for competitive quizzing
- Real-time interactions

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend-hackathon-quizz-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables:
   ```bash
   export VITE_BACKEND_URL=http://localhost:5000
   ```

4. Run the application:
   ```bash
   npm run dev
   ```

## Project Structure
```
frontend-hackathon-quizz-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

## License
MIT
