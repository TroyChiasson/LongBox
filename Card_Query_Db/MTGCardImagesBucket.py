import requests
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage

# Need the SDK key to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'storageBucket': 'sinuous-vortex-411619.appspot.com'
})

base_api_url = "https://api.scryfall.com/cards/search"

def fetch_and_upload_images():
    batch_size = 10  # Adjust batch size based on your needs
    page = 1

    while True:
        params = {
            "q": "game:paper",
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

            # Split cards into batches
            for i in range(0, len(cards_on_page), batch_size):
                batch = cards_on_page[i:i+batch_size]
                upload_images_batch(batch)

            page += 1
        else:
            print(f"Error fetching cards. Status Code: {response.status_code}")
            break

def upload_images_batch(cards):
    for card in cards:
        upload_image_to_storage(card)

def upload_image_to_storage(card):
    # Remove leading and trailing spaces
    card_name = card.get("name", "Unnamed Card").strip()
    collector_num = card.get("collector_number")
    # Get a list of set codes for this card
    set_code = card.get("set")

    foil = card.get("foil")

    # Extract 3-letter set code from the border crop image URL
    border_crop_url = card.get("image_uris", {}).get("border_crop", "")

    if not border_crop_url:
        print(f"No image URL found for card: {card_name} with set code {set_code}")
        return

    # make it lowercase to fit the folder description
    first_letter = card_name[0].lower()

    # Determine the folder based on regular or foil printing
    folder = "mtg_names_images/" + first_letter + "/" + card_name + "/"

    # Print the set code and type for each unique printing
    print(f"Processing card: {card_name}")
    print(f"Set code for {card_name}: {set_code}")
    print(f"Collector Number for {card_name}: {collector_num}")

    # Get image data from the URL
    image_data = requests.get(border_crop_url)
    if image_data.status_code == 200:
        # Upload image to Firebase Storage
        bucket = storage.bucket()
        filename = f"{set_code}_{collector_num}.jpg"
        blob = bucket.blob(folder + filename)
        blob.upload_from_string(image_data.content, content_type='image/jpeg', timeout=120)
        # Tell it worked
        print(f"Uploaded image for {card_name} with set code {set_code} to Firebase Storage in folder: {folder}")
    else:
        print(f"Failed to fetch image for card: {card_name} with set code {set_code}")

if __name__ == "__main__":
    fetch_and_upload_images()
