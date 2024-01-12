import requests


flag = "name"
# if doing name
if flag == "name":
    name = "mana crypt"
    name = name.replace(" ","+")

    x = requests.get("https://api.scryfall.com/cards/named?fuzzy=" + name)
    
    print(x.text)


# if using origin text
if flag == "o":
    text = "When Arboreal Grazer enters the battlefield,\nyou may put a land card from your hand\nonto the battlefield tapped."

    text = "%22" + text.replace(" ", "+").replace("\n", "+") + "%22"

    x = requests.get("https://api.scryfall.com/cards/search?q=o%3A" + text)

    print(x.text)


# curl "https://api.scryfall.com/cards/search?q=o%3A%22when+arboreal%22"

# Enchanted+permanent+cant+attack+or+block,+and+its+activated+abilities+cant+be+activated+Those+who+break+the+laws+of+the+Malamet+become+cold+silent+warnings+to+others+who+might+try

# /usr/local/bin/python3 /Users/troy/Desktop/LongboxWIP/LongBox/recog/scry.py > scry.txt