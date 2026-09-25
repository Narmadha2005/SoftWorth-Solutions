# 📄 Document Management & AI Q&A System

An AI-powered document management and question-answering web application that allows users to upload documents, manage them, and ask questions about their uploaded content using Google Gemini.

The system retrieves relevant information from uploaded documents and provides AI-generated answers along with the source documents.

---

## 🚀 Features

- 📤 Upload documents
- 📋 View uploaded documents
- 📥 Download documents
- 🗑️ Delete documents
- 🤖 AI-powered document question answering
- 🔎 Keyword-based document retrieval
- 📚 Source document display with AI answers
- 💾 SQLite database for document metadata and extracted text
- 📁 Local file storage
- 🔐 Environment variable support for API keys
- 🌐 React-based web interface
- ⚡ Flask REST API

---

## Architecture

```text
                         USER
                           │
                           ▼
                 ┌─────────────────┐
                 │ React + Vite    │
                 │    Frontend     │
                 └────────┬────────┘
                          │
                        Axios
                          │
                          ▼
                 ┌─────────────────┐
                 │ Flask Backend   │
                 │   REST APIs     │
                 └───────┬─────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
          SQLAlchemy   File      Gemini API
              │       Storage        │
              ▼          │            │
           SQLite     uploads/       │
           Database       │            │
              │          │            │
              └──────────┴────────────┘
                         │
                         ▼
                    AI Answer
                         │
                         ▼
                  React Frontend
