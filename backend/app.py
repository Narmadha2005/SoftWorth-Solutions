import os
import uuid

from dotenv import load_dotenv

load_dotenv()


from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory
)

from flask_cors import CORS

from database import db
from models import Document
from extract import extract_text
from chat import answer_question


# ==========================================
# Flask application
# ==========================================

app = Flask(__name__)

CORS(app)


# ==========================================
# Configuration
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///documents.db"
)


app.config[
    "SQLALCHEMY_DATABASE_URI"
] = DATABASE_URL


app.config[
    "SQLALCHEMY_TRACK_MODIFICATIONS"
] = False


# ==========================================
# Initialize database
# ==========================================

db.init_app(app)


# ==========================================
# Allowed files
# ==========================================

ALLOWED_EXTENSIONS = {
    "txt",
    "md",
    "json"
}


MAX_FILE_SIZE = 10 * 1024 * 1024


app.config[
    "MAX_CONTENT_LENGTH"
] = MAX_FILE_SIZE


def allowed_file(filename):

    if not filename:
        return False

    if "." not in filename:
        return False

    extension = filename.rsplit(
        ".",
        1
    )[1].lower()

    return extension in ALLOWED_EXTENSIONS


# ==========================================
# Create database
# ==========================================

with app.app_context():

    db.create_all()


# ==========================================
# Home
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Document Management AI API is running",
        "status": "success"
    })


# ==========================================
# Get all documents
# ==========================================

@app.route(
    "/api/documents",
    methods=["GET"]
)
def get_documents():

    documents = Document.query.order_by(
        Document.created_at.desc()
    ).all()

    return jsonify([
        document.to_dict()
        for document in documents
    ])


# ==========================================
# Upload document
# ==========================================

@app.route(
    "/api/documents",
    methods=["POST"]
)
def upload_document():

    # Check file
    if "file" not in request.files:

        return jsonify({
            "error": "No file uploaded"
        }), 400


    file = request.files["file"]


    # Check filename
    if not file.filename:

        return jsonify({
            "error": "No file selected"
        }), 400


    # Check extension
    if not allowed_file(
        file.filename
    ):

        return jsonify({
            "error": (
                "Invalid file type. "
                "Only .txt, .md and .json "
                "files are allowed."
            )
        }), 400


    original_name = file.filename


    extension = original_name.rsplit(
        ".",
        1
    )[1].lower()


    # Create unique filename
    stored_name = (
        f"{uuid.uuid4().hex}.{extension}"
    )


    file_path = os.path.join(
        UPLOAD_FOLDER,
        stored_name
    )


    try:

        # Save file
        file.save(
            file_path
        )


        # Get size
        file_size = os.path.getsize(
            file_path
        )


        # Extract text
        extracted_text = extract_text(
            file_path,
            extension
        )


        # Create database record
        document = Document(

            original_name=original_name,

            stored_name=stored_name,

            file_path=file_path,

            file_type=extension,

            file_size=file_size,

            extracted_text=extracted_text
        )


        db.session.add(
            document
        )

        db.session.commit()


        return jsonify({

            "message": (
                "Document uploaded successfully"
            ),

            "document": document.to_dict()

        }), 201


    except Exception as error:

        # Remove file if something failed
        if os.path.exists(
            file_path
        ):

            os.remove(
                file_path
            )


        db.session.rollback()


        return jsonify({

            "error": str(error)

        }), 500


# ==========================================
# Download document
# ==========================================

@app.route(
    "/api/documents/<int:document_id>/download",
    methods=["GET"]
)
def download_document(
    document_id
):

    document = Document.query.get(
        document_id
    )


    if not document:

        return jsonify({
            "error": "Document not found"
        }), 404


    if not os.path.exists(
        document.file_path
    ):

        return jsonify({
            "error": "File not found on server"
        }), 404


    return send_from_directory(

        UPLOAD_FOLDER,

        document.stored_name,

        as_attachment=True,

        download_name=document.original_name
    )


# ==========================================
# Delete document
# ==========================================

@app.route(
    "/api/documents/<int:document_id>",
    methods=["DELETE"]
)
def delete_document(
    document_id
):

    document = Document.query.get(
        document_id
    )


    if not document:

        return jsonify({
            "error": "Document not found"
        }), 404


    try:

        # Delete physical file
        if os.path.exists(
            document.file_path
        ):

            os.remove(
                document.file_path
            )


        # Delete database record
        db.session.delete(
            document
        )

        db.session.commit()


        return jsonify({

            "message": (
                "Document deleted successfully"
            )

        })


    except Exception as error:

        db.session.rollback()

        return jsonify({

            "error": str(error)

        }), 500


# ==========================================
# Chat
# ==========================================

@app.route(
    "/api/chat",
    methods=["POST"]
)
def chat():

    data = request.get_json(
        silent=True
    )


    if not data:

        return jsonify({

            "error": (
                "Request body is required"
            )

        }), 400


    question = data.get(
        "question",
        ""
    )


    if not isinstance(
        question,
        str
    ):

        return jsonify({

            "error": (
                "Question must be text"
            )

        }), 400


    question = question.strip()


    if not question:

        return jsonify({

            "error": (
                "Question cannot be empty"
            )

        }), 400


    try:

        result = answer_question(
            question
        )

        return jsonify(
            result
        )


    except Exception as error:

        return jsonify({

            "error": str(error)

        }), 500


# ==========================================
# Error: file too large
# ==========================================

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({

        "error": (
            "File is too large. "
            "Maximum size is 10 MB."
        )

    }), 413


# ==========================================
# Error: 404
# ==========================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "error": "Endpoint not found"

    }), 404


# ==========================================
# Run application
# ==========================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=4000,

        debug=True
    )