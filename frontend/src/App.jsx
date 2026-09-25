import { useEffect, useState } from "react";

import {
    getDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    askQuestion
} from "./api";

import "./App.css";


function App() {

    const [documents, setDocuments] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);

    const [question, setQuestion] = useState("");

    const [answer, setAnswer] = useState("");

    const [sources, setSources] = useState([]);

    const [loading, setLoading] = useState(false);

    const [uploading, setUploading] = useState(false);


    // =====================================
    // Load documents
    // =====================================

    const loadDocuments = async () => {

        try {

            const response = await getDocuments();

            setDocuments(response.data);

        } catch (error) {

            console.error(
                "Failed to load documents:",
                error
            );

        }

    };


    useEffect(() => {

        loadDocuments();

    }, []);


    // =====================================
    // Upload document
    // =====================================

    const handleUpload = async () => {

        if (!selectedFile) {

            alert("Please select a file first.");

            return;
        }

        try {

            setUploading(true);

            await uploadDocument(selectedFile);

            setSelectedFile(null);

            document.getElementById(
                "fileInput"
            ).value = "";

            await loadDocuments();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                "Upload failed."
            );

        } finally {

            setUploading(false);

        }

    };


    // =====================================
    // Delete document
    // =====================================

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteDocument(id);

            await loadDocuments();

        } catch (error) {

            alert("Failed to delete document.");

        }

    };


    // =====================================
    // Ask AI
    // =====================================

    const handleAsk = async () => {

        if (!question.trim()) {

            return;
        }

        try {

            setLoading(true);

            setAnswer("");

            setSources([]);

            const response = await askQuestion(
                question
            );

            setAnswer(
                response.data.answer
            );

            setSources(
                response.data.sources || []
            );

        } catch (error) {

            setAnswer(
                error.response?.data?.error ||
                "Unable to get an AI response."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // Enter key for chat
    // =====================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleAsk();

        }

    };


    return (

        <div className="app">

            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <header className="header">

                <div className="brand">

                    <div className="brand-icon">
                        ✦
                    </div>

                    <div>
                        <h2>
                            Document AI
                        </h2>

                        <span>
                            Intelligent Document Assistant
                        </span>
                    </div>

                </div>


                <div className="status">

                    <span className="status-dot"></span>

                    API Connected

                </div>

            </header>


            {/* ================================= */}
            {/* Main */}
            {/* ================================= */}

            <main className="main">

                <section className="hero">

                    <div>

                        <span className="badge">
                            AI POWERED
                        </span>

                        <h1>
                            Document Management
                            <span> & AI Q&A</span>
                        </h1>

                        <p>
                            Upload your documents, manage your files,
                            and ask questions using AI-powered
                            document understanding.
                        </p>

                    </div>

                </section>


                {/* ================================= */}
                {/* Statistics */}
                {/* ================================= */}

                <section className="stats">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📄
                        </div>

                        <div>

                            <span>
                                Documents
                            </span>

                            <strong>
                                {documents.length}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            🧠
                        </div>

                        <div>

                            <span>
                                AI Assistant
                            </span>

                            <strong>
                                Gemini
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            🔒
                        </div>

                        <div>

                            <span>
                                Storage
                            </span>

                            <strong>
                                Local
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ================================= */}
                {/* Upload */}
                {/* ================================= */}

                <section className="card upload-card">

                    <div className="section-title">

                        <div className="title-icon">
                            ↑
                        </div>

                        <div>

                            <h2>
                                Upload Documents
                            </h2>

                            <p>
                                Add TXT, Markdown or JSON files
                            </p>

                        </div>

                    </div>


                    <div className="upload-area">

                        <div className="upload-symbol">
                            ↑
                        </div>

                        <h3>
                            Choose a document
                        </h3>

                        <p>
                            Supported formats: .txt, .md, .json
                        </p>


                        <input
                            id="fileInput"
                            type="file"
                            accept=".txt,.md,.json"
                            onChange={(event) =>
                                setSelectedFile(
                                    event.target.files[0]
                                )
                            }
                        />


                        {selectedFile && (

                            <div className="selected-file">

                                📄 {selectedFile.name}

                            </div>

                        )}


                        <button
                            className="primary-button"
                            onClick={handleUpload}
                            disabled={
                                !selectedFile ||
                                uploading
                            }
                        >

                            {uploading
                                ? "Uploading..."
                                : "Upload Document"
                            }

                        </button>

                    </div>

                </section>


                {/* ================================= */}
                {/* Documents */}
                {/* ================================= */}

                <section className="card">

                    <div className="section-title">

                        <div className="title-icon">
                            ☷
                        </div>

                        <div>

                            <h2>
                                Your Documents
                            </h2>

                            <p>
                                Manage your uploaded files
                            </p>

                        </div>

                    </div>


                    {documents.length === 0 ? (

                        <div className="empty">

                            <div>
                                📂
                            </div>

                            <h3>
                                No documents yet
                            </h3>

                            <p>
                                Upload a document to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="document-list">

                            {documents.map(
                                (document) => (

                                <div
                                    className="document-row"
                                    key={document.id}
                                >

                                    <div className="document-info">

                                        <div className="file-icon">
                                            📄
                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    document.original_name
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    document.file_type
                                                }{" "}
                                                •{" "}
                                                {
                                                    document.file_size
                                                }{" "}
                                                bytes
                                            </p>

                                        </div>

                                    </div>


                                    <div className="document-actions">

                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                downloadDocument(
                                                    document.id
                                                )
                                            }
                                        >
                                            Download
                                        </button>


                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                handleDelete(
                                                    document.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* ================================= */}
                {/* AI Chat */}
                {/* ================================= */}

                <section className="card ai-card">

                    <div className="section-title">

                        <div className="ai-icon">
                            ✦
                        </div>

                        <div>

                            <h2>
                                Ask Your Documents
                            </h2>

                            <p>
                                Get answers from your uploaded files
                            </p>

                        </div>

                    </div>


                    <div className="chat-box">

                        <textarea
                            placeholder="Ask something about your documents..."
                            value={question}
                            onChange={(event) =>
                                setQuestion(
                                    event.target.value
                                )
                            }
                            onKeyDown={handleKeyDown}
                        />


                        <div className="chat-footer">

                            <span>
                                Press Enter to ask
                            </span>

                            <button
                                className="ask-button"
                                onClick={handleAsk}
                                disabled={
                                    loading ||
                                    !question.trim()
                                }
                            >

                                {loading
                                    ? "Thinking..."
                                    : "Ask AI →"
                                }

                            </button>

                        </div>

                    </div>


                    {/* AI Answer */}

                    {answer && (

                        <div className="answer-box">

                            <div className="answer-header">

                                <div className="answer-icon">
                                    ✦
                                </div>

                                <div>

                                    <h3>
                                        AI Answer
                                    </h3>

                                    <span>
                                        Generated from your documents
                                    </span>

                                </div>

                            </div>


                            <p className="answer-text">
                                {answer}
                            </p>


                            {sources.length > 0 && (

                                <div className="sources">

                                    <h4>
                                        Sources
                                    </h4>

                                    {sources.map(
                                        (source) => (

                                        <div
                                            className="source"
                                            key={source.id}
                                        >

                                            <span>
                                                📄
                                            </span>

                                            <span>
                                                {source.name}
                                            </span>

                                            <small>
                                                Relevance:{" "}
                                                {
                                                    source.relevance_score
                                                }
                                            </small>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    )}

                </section>

            </main>


            {/* ================================= */}
            {/* Footer */}
            {/* ================================= */}

            <footer>

                Document AI • Flask + React + SQLite + Gemini

            </footer>

        </div>

    );

}

export default App;