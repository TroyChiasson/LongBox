package com.scrollrackcompanion;

public class Card {
    private String cardName;
    private String cardSet;
    private String cardPrice;


    public Card(String cardName, String cardSet, String cardPrice) {
        this.cardName = cardName;
        this.cardPrice = cardPrice;
        this.cardSet = cardSet;
    }

    public String getCardName() {
        return cardName;
    }

    public void setCardName(String cardName) {
        this.cardName = cardName;
    }

    public String getCardSet() {
        return cardSet;
    }

    public void setCardSet(String cardSet) {
        this.cardSet = cardSet;
    }

    public String getCardPrice() {
        return cardPrice;
    }

    public void setCardPrice(String cardPrice) {
        this.cardPrice = cardPrice;
    }
}
