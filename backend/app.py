from flask import Flask, request, jsonify
from flask_cors import CORS
from models.predict import classify_threat
import traceback
import sqlite3

app = Flask(__name__)
CORS(app)  # allow http://localhost:* during development

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    try:
        data = request.get_json(force=True, silent=True) or {}
        url  = (data.get("url") or "").strip()
        text = (data.get("text") or "").strip()

        result = classify_threat(text=text, url=url) or {}

        # Coerce all fields to JSON-safe primitives (avoid numpy types causing 500s)
        out = {
            "label":        str(result.get("label", "")),
            "probability":  float(result.get("probability", 0.0)),
            "threat_level": str(result.get("threat_level", "")),
            "reason":       str(result.get("reason", "")),
        }
        return jsonify(out), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# (Optional) Keep history endpoint if you still want it later; safe as-is.
@app.route("/history", methods=["GET"])
def history():
    try:
        conn = sqlite3.connect('queries.db')
        cursor = conn.cursor()
        cursor.execute("""
            SELECT url, text, confidence_score, threat_level, timestamp
            FROM queries ORDER BY id DESC LIMIT 10
        """)
        rows = cursor.fetchall()
        conn.close()

        history_data = [
            {
                "url": row[0] or "",
                "text": row[1] or "",
                "confidence_score": float(row[2] or 0.0),
                "threat_level": row[3] or "",
                "timestamp": row[4] or "",
            }
            for row in rows
        ]
        return jsonify(history_data), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200


if __name__ == "__main__":
    app.run(debug=True)
