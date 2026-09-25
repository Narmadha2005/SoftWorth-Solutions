import re

from models import Document
from llm import ask_gemini


def clean_words(text):

    words = re.findall(
        r"\b[a-zA-Z0-9]+\b",
        text.lower()
    )

    return set(words)


def answer_question(question):

    documents = Document.query.all()

    if not documents:

        return {
            "answer": "No documents have been uploaded yet.",
            "sources": []
        }

    question_words = clean_words(
        question
    )

    ranked_documents = []

    for document in documents:

        text = document.extracted_text or ""

        document_words = clean_words(
            text
        )

        common_words = (
            question_words &
            document_words
        )

        score = len(common_words)

        if score > 0:

            ranked_documents.append(
                (
                    score,
                    document
                )
            )

    ranked_documents.sort(
        key=lambda item: item[0],
        reverse=True
    )

    # Use top 5 relevant documents
    ranked_documents = ranked_documents[:5]

    if not ranked_documents:

        return {
            "answer": (
                "I could not find relevant "
                "information in the uploaded documents."
            ),
            "sources": []
        }

    context_parts = []

    sources = []

    for score, document in ranked_documents:

        context_parts.append(
            f"""
Document: {document.original_name}

{document.extracted_text}
"""
        )

        sources.append({
            "id": document.id,
            "name": document.original_name,
            "relevance_score": score
        })

    context = "\n--------------------\n".join(
        context_parts
    )

    answer = ask_gemini(
        question,
        context
    )

    return {
        "answer": answer,
        "sources": sources
    }