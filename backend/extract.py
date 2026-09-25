import json


def extract_text(file_path, file_type):

    try:

        if file_type in ["txt", "md"]:

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                return file.read()

        elif file_type == "json":

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(file)

                return json.dumps(
                    data,
                    indent=2,
                    ensure_ascii=False
                )

        return ""

    except Exception as error:

        raise Exception(
            f"Text extraction failed: {error}"
        )