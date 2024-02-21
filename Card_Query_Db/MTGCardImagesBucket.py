import requests
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage

# need the sdk key to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'storageBucket': 'sinuous-vortex-411619.appspot.com'
})

base_api_url = "https://api.scryfall.com/cards/search"

def fetch_and_upload_images():
    page = 1

    # testing whether is works better with q is booster, having troubles
    while True:
        params = {
            "q": "is:booster",
            "page": page,
            "format": "json",

        }
        response = requests.get(base_api_url, params=params)

        if response.status_code == 200:
            card_data = response.json()
            cards_on_page = card_data.get('data', [])

            if not cards_on_page:
                print(f"No more cards on page {page}.")
                break

            for card in cards_on_page:
                upload_image_to_storage(card)

            page += 1
        else:
            print(f"Error fetching cards. Status Code: {response.status_code}")
            break

def upload_image_to_storage(card):
    # Remove leading and trailing spaces
    card_name = card.get("name", "Unnamed Card").strip()
    # Get a list of set names for this card still wonky needs work
    set_names = card.get("prints_search_uri", [])
    
    # make it lowercase to fit the folder description
    first_letter = card_name[0].lower()

    # Print card name for testing
    print(f"Processing card: {card_name}")

    # This could lead to an issue later on
    if not first_letter.isalpha():
        print(f"Invalid first letter for card '{card_name}': {first_letter}")
        return

    image_uris = card.get("image_uris", {})
    # Get a list of all image URLs available for the card
    image_urls = [image_uris.get(key) for key in image_uris.keys()]

    if image_urls:
        for index, image_url in enumerate(image_urls):
            # Get the corresponding set name for this image
            if index < len(set_names):
                set_name = set_names[index]
            else:
                set_name = "Unknown Set"

            # Print the set name for each unique printing
            print(f"Set for {card_name} ({index+1}): {set_name}")

            # Get image data from the URL
            image_data = requests.get(image_url)
            if image_data.status_code == 200:
                # Upload image to Firebase Storage
                bucket = storage.bucket()
                # Pathway for adding to storage, including the set name, card name, and an index in the filename for uniqueness
                filename = f"{set_name}_{card_name}_{index}.jpg"
                blob = bucket.blob(f"mtg_names_images/{first_letter}/{card_name}/{filename}")
                blob.upload_from_string(image_data.content, content_type='image/jpeg')
                # Tell it worked
                print(f"Uploaded image {index+1} for {card_name} from set: {set_name} to Firebase Storage.")
            else:
                print(f"Failed to fetch image {index+1} for card: {card_name} from set: {set_name}")
    else:
        print(f"No image URLs found for card: {card_name}")

if __name__ == "__main__":
    fetch_and_upload_images()
