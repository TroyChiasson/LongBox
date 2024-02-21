from firebase_admin import credentials, firestore, initialize_app, functions
import os
from google.cloud.firestore_v1.base_query import FieldFilter
from firebase_functions import https_fn

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

credentials_path = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

#initialize_app(credentials.Certificate(credentials_path))

firebase_app = initialize_app(credentials_path)

db = firestore.Client()

# Define the Cloud Function to add a card
@https_fn.on_request()
def add_card(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'POST':
        # Extract JSON data from the POST request body
        data = req.get_json()

        # Access the individual fields (cardname, manacost, color) from the JSON data
        card_name = data.get('cardname')
        mana_cost = data.get('manacost')
        color = data.get('color')
    # Validate data (you can add more robust validation here)

    # Add the card to the database
    card_ref = db.collection('cards').document()
    card_ref.set({
        'cardName': card_name,
        'color': color,
        'manaCost': mana_cost
    })

    # Log success (optional)
    print('Card added successfully')

# Deploy the Cloud Function
add_card_function = functions.https.on_request(add_card)