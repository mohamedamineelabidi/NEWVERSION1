import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import LabelEncoder

# Load data and model
data = pd.read_excel("data/Cleaned_Combined_Clubs_finals.xlsx")
y = data['Formation']
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
model = joblib.load('models/best_rf_model_new.pkl')

# Function to predict the formation
def get_prediction_model(xG, xGA, Poss, xA, KP, PPA, PrgP):
    try:
        df = pd.DataFrame({
            'xG': [float(xG)], 
            'xGA': [float(xGA)], 
            'Poss': [float(Poss)], 
            'xA': [float(xA)], 
            'KP': [int(KP)], 
            'PPA': [int(PPA)], 
            'PrgP': [int(PrgP)]
        })
        predicted_formation = model.predict(df)
        return label_encoder.inverse_transform(predicted_formation)[0]
    except Exception as e:
        raise ValueError(f"Error processing input data: {str(e)}")

# Flask app setup
app = Flask(__name__)
CORS(app)

@app.route('/predict_formation', methods=['POST'])
def predict_formation():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_keys = ["xG", "xGA", "Poss", "xA", "KP", "PPA", "PrgP"]
        missing_keys = [key for key in required_keys if key not in data]
        
        if missing_keys:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_keys)}"}), 400

        prediction = get_prediction_model(
            data["xG"], data["xGA"], data["Poss"], 
            data["xA"], data["KP"], data["PPA"], data["PrgP"]
        )
        
        return jsonify({"prediction": prediction, "status": "success"})

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)