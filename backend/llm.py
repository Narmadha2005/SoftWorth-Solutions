import os

from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()


API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


if API_KEY:

    genai.configure(
        api_key=API_KEY
    )


def ask_gemini(question, context):

    if not API_KEY:

        return (
            "Gemini API key is not configured. "
            "Please add GEMINI_API_KEY to the .env file."
        )

    try:

        model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

        prompt = f"""
You are an AI document assistant.

Answer the user's question using ONLY
the information available in the uploaded
documents.

If the answer cannot be found in the
documents, clearly say:

"I could not find the answer in the uploaded documents."

Do not invent information.

DOCUMENTS:
-------------------------
{context}
-------------------------

USER QUESTION:
{question}

Give a clear and simple answer.
"""

        response = model.generate_content(
            prompt
        )

        if response.text:

            return response.text

        return "No answer was generated."

    except Exception as error:

        return f"Gemini error: {error}"