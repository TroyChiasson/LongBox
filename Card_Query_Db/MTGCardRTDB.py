import requests
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import date, timedelta

# Need sdk key and its location to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sinuous-vortex-411619-default-rtdb.firebaseio.com'
})


color_mapping = {
    'W': 1,
    'U': 1,
    'B': 1,
    'R': 1,
    'G': 1,
}

base_api_url = "https://api.scryfall.com/cards/search"

def fetch_and_upload_cards(batch_size=10):
    page = 1

    while True:
        params = {
            "q": "game:paper",
            "page": page,
            "format": "json",
            "unique": "prints",
            "game": "paper"
        }
        response = requests.get(base_api_url, params=params)

        if response.status_code == 200:
            card_data = response.json()
            cards_on_page = card_data.get('data', [])

            if not cards_on_page:
                print(f"No more cards on page {page}.")
                break

       
            for i in range(0, len(cards_on_page), batch_size):
                batch = cards_on_page[i:i + batch_size]
                process_batch(batch)

            page += 1
        else:
            print(f"Error fetching cards. Status Code: {response.status_code}")
            break

def process_batch(cards):
    for card in cards:

        if 'card_faces' in card:
            for face in card['card_faces']:
                print_extracted_data(face)
                upload_to_firestore(face)
        else:
            print_extracted_data(card)
            upload_to_firestore(card)

def print_extracted_data(card):

    card_name = card.get("name", "Unnamed Card").strip() 
    first_letter = card_name[0].lower()


    if 'card_faces' in card:

        card_name = card['card_faces'][0].get('name', card_name)


    card_name = card_name.replace(".", " ")


    card_name = card_name.replace("?", "_").replace("!", "_")


    colors = card.get('colors', [])
    mana_cost = card.get("mana_cost", "N/A")
    converted_mana_cost = calculate_converted_mana_cost(mana_cost)
    type_line = card.get("type_line", "N/A").split(" — ") 
    card_id = card.get("id")
    set_code = card.get("set")
    color_identity = card.get("color_identity")
    prices = {
        "usd": card.get("prices", {}).get("usd", None),
        "usd_foil": card.get("prices", {}).get("usd_foil", None),
        "usd_etched": card.get("prices", {}).get("usd_etched", None)
    }

    print(f"Card Name: {card_name}")
    print(f"Colors: {colors}")
    print(f"Mana Cost: {mana_cost}")
    print(f"Converted Mana Cost: {converted_mana_cost}")
    print(f"Type of Card: {type_line}")
    print(f"Card ID: {card_id}")
    print(f"Set Code: {set_code}")
    print(f"Color identity: {color_identity}")
    print(f"Prices: {prices}")
    print("-" * 30)

def upload_to_firestore(card):

    card_name = card.get("name", "Unnamed Card").strip()  
    first_letter = card_name[0].lower()

    if 'card_faces' in card:
        card_name = card['card_faces'][0].get('name', card_name)

    card_name = card_name.replace(".", " ")
    card_name = card_name.replace("?", "_").replace("!", "_")
    card_name = card_name.replace("/", "-").replace("#", "-") 

    colors = card.get('colors', [])
    mana_cost = card.get("mana_cost", "N/A")
    converted_mana_cost = calculate_converted_mana_cost(mana_cost)
    type_line = card.get("type_line", "N/A").split(" — ")
    card_id = card.get("id")
    set_code = card.get("set")
    color_identity = card.get("color_identity")
    collector_num = card.get("collector_number")
    prices = {
        "usd": card.get("prices", {}).get("usd", None),
        "usd_foil": card.get("prices", {}).get("usd_foil", None),
        "usd_etched": card.get("prices", {}).get("usd_etched", None)
    }

    ref = db.reference(f"/mtg_names/{first_letter}/cards/{card_name}/{set_code}_{collector_num}")

    existing_card = ref.get()
    if existing_card:
        # print(f"Updating {card_name} in Firestore under /mtg_names/{first_letter}/cards.")

        compare_prices(card_name, set_code, prices, ref)  # Pass ref to update the data
    else:
        # print(f"Adding {card_name} to Firestore under /mtg_names/{first_letter}/cards.")
        ref.set({
            "name": card_name,
            "colors": colors,
            "mana_cost": mana_cost,
            "converted_mana_cost": converted_mana_cost,
            "type_of_card": type_line,
            "id": card_id,
            "set_code": set_code,
            "color_identity": color_identity,
            "prices": prices,
            "collector_number":collector_num
        })

        # print(f"Uploaded {card_name} to Firestore under /mtg_names/{first_letter}/cards.")

    store_prices_all_cards(card_name, set_code, prices, collector_num)

def calculate_converted_mana_cost(mana_cost):

    total_cost = 0
    for char in mana_cost:
        if char.isdigit():
            total_cost += int(char)
        elif char in color_mapping:
            total_cost += color_mapping[char]
    
    return total_cost

def store_prices_all_cards(card_name, set_code, prices, collector_num):

    first_letter = card_name[0].lower()
 
    ref = db.reference(f"/Prices/All_cards/{first_letter}/{card_name}/{set_code}_{collector_num}")


    today = date.today().isoformat()


    existing_prices = ref.get() or {}


    existing_prices[today] = {
        "usd": prices.get("usd", None),
        "usd_foil": prices.get("usd_foil", None),
        "usd_etched": prices.get("usd_etched", None),
        "set_name": set_code,
        "collector_number": collector_num,
    }


    existing_prices[today] = prices


    week_ago = (date.today() - timedelta(days=7)).isoformat()
    for date_key in list(existing_prices.keys()):
        if date_key < week_ago:
            del existing_prices[date_key]

    ref.set(existing_prices)

   
    compare_and_update_top_differences(card_name, set_code, today, prices, existing_prices, collector_num)

def compare_and_update_top_differences(card_name, set_code, today, new_prices, existing_prices, collector_num):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    yesterday_prices = existing_prices.get(yesterday, {})

    # print(yesterday_prices)
    # print(new_prices)

    if yesterday_prices:
        for price_type, new_price in new_prices.items():
            if new_price is not None:
                yesterday_price = yesterday_prices.get(price_type, None)
                if yesterday_price is not None:

                    new_price = float(new_price)
                    print(new_price)
                    yesterday_price = float(yesterday_price)

                    price_diff = new_price - yesterday_price
                    print("price diff", price_diff)
                    percentage_change = ((new_price - yesterday_price) / yesterday_price) * 100 if yesterday_price != 0 else 0

           
                    if "_foil" in price_type:
                        update_top_differences(card_name, set_code, price_type, price_diff, percentage_change, collector_num, is_foil=True)
                    else:
                        update_top_differences(card_name, set_code, price_type, price_diff, percentage_change, collector_num, is_foil=False)


def update_top_differences(card_name, set_code, price_type, price_diff, percentage_change, collector_num, is_foil=False):
    if is_foil:
        positive_diff_ref_foil = db.reference("/Prices/Top50/Positive_Foil")
        negative_diff_ref_foil = db.reference("/Prices/Top50/Negative_Foil")
    else:
        positive_diff_ref = db.reference("/Prices/Top50/Positive")
        negative_diff_ref = db.reference("/Prices/Top50/Negative")

    positive_differences = positive_diff_ref.get() or []
    negative_differences = negative_diff_ref.get() or []

    positive_differences_foil = positive_diff_ref.get() or []
    negative_differences_foil = negative_diff_ref.get() or []

    print("right before price diff")

    if price_diff > 0:
        difference = {
            "card_name": card_name,
            "set_code": set_code,
            "price_type": price_type,
            "price_diff": price_diff,
            "percentage_change": percentage_change,
            "collector_number": collector_num
        }
        print("we get into price diff >")
        if is_foil:
            positive_differences_foil.append(difference)
            positive_differences = sorted(positive_differences, key=lambda x: x["price_diff"], reverse=True)[:50]
            positive_diff_ref.set(positive_differences)
        else:
            positive_differences.append(difference)
            positive_differences = sorted(positive_differences, key=lambda x: x["price_diff"], reverse=True)[:50]
            positive_diff_ref.set(positive_differences)
    elif price_diff < 0:
        difference = {
            "card_name": card_name,
            "set_code": set_code,
            "price_type": price_type,
            "price_diff": price_diff,
            "percentage_change": percentage_change,
            "collector_number": collector_num
        }
        print("we get into price diff <")
        if is_foil:
            negative_differences_foil.append(difference)
            negative_differences = sorted(negative_differences, key=lambda x: x["price_diff"])[:50]
            negative_diff_ref.set(negative_differences)
        else:
            negative_differences.append(difference)
            negative_differences = sorted(negative_differences, key=lambda x: x["price_diff"])[:50]
            negative_diff_ref.set(negative_differences)

    print(positive_differences)
    print(negative_differences)

def compare_prices(card_name, set_code, new_prices, ref):
   
    today = date.today().isoformat()

    existing_prices = ref.get() or {}

    # print(existing_prices)


    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # print(yesterday)
    # print(existing_prices)

    yesterday_prices = existing_prices.get(yesterday, {})

    # print(yesterday_prices)
    # print(new_prices.items())


    if yesterday_prices:
        for price_type, new_price in new_prices.items():
            if new_price is not None:
                yesterday_price = yesterday_prices.get(price_type, None)
                if yesterday_price is not None:
                    new_price = float(new_price)
                    print("other new price", new_price)
                    yesterday_price = float(yesterday_price)
                    price_diff = new_price - yesterday_price
                    percentage_change = ((new_price - yesterday_price) / yesterday_price) * 100 if yesterday_price != 0 else 0
                   
                    update_card_prices(ref, price_type, today, new_price, price_diff, percentage_change)

def update_card_prices(ref, price_type, date, new_price, price_diff, percentage_change):
  
    data_to_update = {
        f"prices": new_price
    }

   
    if not ref.child(f"price_diff").get():
        data_to_update[f"price_diff"] = price_diff

    
    if not ref.child(f"percentage_change").get():
        data_to_update[f"percentage_change"] = percentage_change

   
    if not ref.child(f"date").get():
        data_to_update[f"date"] = date


    ref.update(data_to_update)


def weekly_top_winners_losers():
  
    today = date.today()

    if today.weekday() != 6:  
        print("Today is not Sunday. Exiting function.")
        return


    last_sunday = today - timedelta(days=today.weekday() + 7)
    last_sunday_str = last_sunday.isoformat()


    ref = db.reference("/Prices/All_cards")
    all_cards_prices = ref.get() or {}

    prices_last_week = {}
    for card_name, card_prices in all_cards_prices.items():
        for date_key, prices in card_prices.items():
            date_obj = date.fromisoformat(date_key)
            if date_obj >= last_sunday:
                prices_last_week[card_name] = prices

    card_changes = {}
    for card_name, card_prices in prices_last_week.items():
        total_change = 0
        for price_type, price_value in card_prices.items():
            if price_type != "percentage_change":  
                total_change += price_value.get("usd", 0) - price_value.get("usd_foil", 0)
        card_changes[card_name] = total_change


    top_winners_losers = sorted(card_changes.items(), key=lambda x: x[1], reverse=True)
    top_winners = top_winners_losers[:50]
    top_losers = top_winners_losers[-50:]


    winners_ref = db.reference("/Prices/Top50Weekly/Winners")
    losers_ref = db.reference("/Prices/Top50Weekly/Losers")
    

    winners_ref.set([])
    losers_ref.set([])
    

    winners_ref.set(top_winners)
    losers_ref.set(top_losers)

    print("Weekly Top 50 Winners:")
    for i, (card, change) in enumerate(top_winners, start=1):
        print(f"{i}. {card} - Change: {change}")

    print("\nWeekly Top 50 Losers:")
    for i, (card, change) in enumerate(top_losers, start=1):
        print(f"{i}. {card} - Change: {change}")

if __name__ == "__main__":
    positive_diff_ref = db.reference("/Prices/Top50/Positive")
    negative_diff_ref = db.reference("/Prices/Top50/Negative")
    positive_diff_ref.delete()
    negative_diff_ref.delete()

    fetch_and_upload_cards()
    weekly_top_winners_losers()
