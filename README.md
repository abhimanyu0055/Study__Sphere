# StudySphere - Academic Resource Platform - Final Version

A full-stack MERN application designed to streamline academic resource sharing, featuring multi-modal study tools including interactive flashcards and community Q&A.

## 🚀 Technical Highlights
* **Complex Data Modeling:** Designed nested NoSQL schemas for multi-layered data (Resources -> Questions -> Replies).
* **Advanced MongoDB Operations:** 
  * Utilized native `$push` and `$pull` operators for deeply nested array manipulation (Flashcards & Q&A).
  * Implemented `$addToSet` to mathematically guarantee relational data integrity (User Bookmarks).
  * Executed highly efficient bulk-fetching using the `$in` operator for personalized user libraries.
* **Dynamic Aggregations:** Engineered MongoDB aggregation pipelines to calculate real-time trending subjects based on community reviews.

## 💻 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Axios, React Router
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT)
* **Database:** MongoDB, Mongoose

## 🛠️ Installation & Setup
1. Clone the repository: `git clone [your-repo-link]`
2. Install dependencies for both frontend and backend: `npm install`
3. Create a `.env` file in the backend directory with `MONGO_URI` and `JWT_SECRET`.
4. Start the development servers: `npm run dev`