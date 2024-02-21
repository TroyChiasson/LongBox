import requests
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# need sdk key and its locatin to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sinuous-vortex-411619-default-rtdb.firebaseio.com'
})

# might not be needed was a testing thing earlier
color_mapping = {
    'W': 'White',
    'U': 'Blue',
    'B': 'Black',
    'R': 'Red',
    'G': 'Green',
}

base_api_url = "https://api.scryfall.com/cards/search"

def fetch_and_upload_cards():
    page = 1

    while True:
        params = {
            "q": "is:booster",
            "page": page,
            "format": "json",
            "unique": "prints"
        }
        response = requests.get(base_api_url, params=params)

        if response.status_code == 200:
            card_data = response.json()
            cards_on_page = card_data.get('data', [])

            if not cards_on_page:
                print(f"No more cards on page {page}.")
                break

            # not sure what to do for double face cards as well as 2 cards one face cards
            for card in cards_on_page:
                # Check if the card has a flip side
                if 'card_faces' in card:
                    for face in card['card_faces']:
                        upload_to_firestore(face)
                else:
                    upload_to_firestore(card)

            page += 1
        else:
            print(f"Error fetching cards. Status Code: {response.status_code}")
            break

def upload_to_firestore(card):
    card_name = card.get("name", "Unnamed Card").strip()  # Remove leading and trailing spaces
    first_letter = card_name[0].lower()

    # Print card name for debugging
    print(f"Processing card: {card_name}")

    if not first_letter.isalpha():
        print(f"Invalid first letter for card '{card_name}': {first_letter}")
        return

    # Check if the card has double-sided faces
    if 'card_faces' in card:
        # Use the name of the first face as the card name
        card_name = card['card_faces'][0].get('name', card_name)

    # Replace "." in card name with a space
    card_name = card_name.replace(".", " ")

    # Remove or replace illegal characters in card name this is because firebase doesn't allow them
    # For example, replacing '?' and '!' with '_'
    card_name = card_name.replace("?", "_").replace("!", "_")

    # Get additional card details needed for actual db
    colors = card.get('colors', [])
    color = ', '.join([color_mapping[c] for c in colors]) if colors else "Colorless"
    num_colors = len(colors)
    mana_cost = card.get("mana_cost", "N/A")
    converted_mana_cost = sum(int(char) for char in mana_cost if char.isdigit())
    type_line = card.get("type_line", "N/A").split(" — ")  # Convert type_line to array
    card_id = card.get("id")

    # Construct the reference to the Firestore document using the card name as the document ID
    ref = db.reference(f"/mtg_names/{first_letter}/cards/{card_name}")

    # Check if the document already exists
    existing_card = ref.get()
    if existing_card:
        print(f"Updating {card_name} in Firestore under /mtg_names/{first_letter}/cards.")
    else:
        print(f"Adding {card_name} to Firestore under /mtg_names/{first_letter}/cards.")

    # Set the fields under the document with the card name
    ref.set({
        "name": card_name,
        "color": color,
        "amount_of_colors": num_colors,
        "mana_cost": mana_cost,
        "converted_mana_cost": converted_mana_cost,
        "type_of_card": type_line,
        "id": card_id
    })

    print(f"Uploaded {card_name} to Firestore under /mtg_names/{first_letter}/cards.")

if __name__ == "__main__":
    fetch_and_upload_cards()
