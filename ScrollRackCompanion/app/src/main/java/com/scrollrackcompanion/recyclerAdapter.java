package com.scrollrackcompanion;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

public class recyclerAdapter extends RecyclerView.Adapter<recyclerAdapter.MyViewHolder> {
    private ArrayList<Card> cardsList;

    public recyclerAdapter(ArrayList<Card> cardsList) {
        this.cardsList = cardsList;
    }

    public static class MyViewHolder extends RecyclerView.ViewHolder {
        private TextView cardNameTxt;
        private TextView cardPriceTxt;
        private TextView cardSetTxt;

        public MyViewHolder(final View view) {
            super(view);

            cardNameTxt = view.findViewById(R.id.textView);
            cardPriceTxt = view.findViewById(R.id.textView2);
            cardSetTxt = view.findViewById(R.id.textView3);
        }
    }

    @NonNull
    @Override
    public recyclerAdapter.MyViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_items, parent, false);
        return new MyViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull recyclerAdapter.MyViewHolder holder, int position) {
        String cardName = cardsList.get(position).getCardName();
        holder.cardNameTxt.setText(cardName);

        String cardPrice = cardsList.get(position).getCardPrice();
        holder.cardPriceTxt.setText(cardPrice);

        String cardSet = cardsList.get(position).getCardSet();
        holder.cardSetTxt.setText(cardSet);
    }

    @Override
    public int getItemCount() {
        return cardsList.size();
    }
}
