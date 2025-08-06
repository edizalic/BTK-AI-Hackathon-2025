#  Hackathon Project – A Personal Journey

### 🛠️ A Note from the Developer

This project was a journey for me — not always a pleasant one, but a journey nonetheless. Along the way, I found myself regretting decisions I didn’t even know could be regretted so quickly. But that’s part of what makes hackathons, game jams, and similar challenges so real: you make a choice, and you commit to it — even if it ends up being the wrong one.

During this project, I went through a rollercoaster of complex emotions. Entering a competition takes courage and self-belief. Entering in the final five days of a two-week event takes sleep — and a lot of caffeine. I made sacrifices, pushed my limits, and no, I probably wouldn’t do it that way again. But when you cross the finish line, all you really want is to feel proud of what you’ve built. If not, you're left questioning every terrible decision, every sleepless night, and every desperate attempt to stay awake with your fifth cup of coffee.

Still, what’s done is done. We can’t go back — but we can always grow from the experience.

---

### 🧠 Project Structure & Tech Stack

This project is built with a modern full-stack architecture, optimized for performance, scalability, and AI integration.

#### 💻 Frontend
- **Framework:** ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)  
- **HTTP Requests:** Axios  
- **Styling:** Tailwind CSS + shadcn/ui  
- Clean, modular UI components with responsive design

#### 🧪 Backend
- **Framework:** ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)  
- **Database:** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) (Dockerized)  
- RESTful API design with clear module separation

#### 🤖 AI & LLM Features
- **LangChain + Gemini 1.5 Flash** integration  
- Key features powered by LLMs:
  - AI-generated dynamic quizzes for courses  
  - Natural language Q&A system  
  - 15-week personalized learning schedule generation  
  - AI-generated assignments tailored to course content  
  - Personalized performance reports based on quiz and assignment results  

---

### 🧑‍🎓 Role-Based Access Control (RBAC)

This platform uses a **4-layer hierarchical user system** to ensure secure and structured permissions:

#### 👑 Admin
- Full access to the system
- Can create: `Supervisors`, `Teachers`, and `Students`
- Manages global system settings

#### 🧭 Supervisor
- Assigned to a department
- Can:
  - Create and manage **courses**
  - Assign **teachers** as course instructors
  - Create `Student` and `Teacher` accounts

#### 📘 Teacher
- Must be created by an `Admin` or `Supervisor`
- Can be assigned as **Instructor** to courses
- Instructors can:
  - Manage their own courses
  - Edit content, quizzes, and assignments

#### 🎓 Student
- Must be created by an `Admin` or `Supervisor`
- Can be enrolled into courses
- No administrative permissions

---

### 🐳 DevOps & Deployment

- **Dockerized PostgreSQL** database  
- Ready for deployment with Docker Compose  
- Easily extensible for NGINX reverse proxy and CI/CD pipelines

---

### 🌱 Final Words

I hope this project inspires you to keep building, keep learning, and keep challenging yourself.

Thank you for reading — and good luck on your own journey.
