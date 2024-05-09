package com.scrollrackcompanion;

import static android.content.ContentValues.TAG;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.DefaultItemAnimator;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import android.view.View;
import android.widget.Button;
import android.widget.SearchView;

import java.util.ArrayList;
import java.util.Map;

public class MainActivity extends AppCompatActivity {
    RecyclerView recyclerView;
    SearchView searchView;
    FirebaseFirestore db = FirebaseFirestore.getInstance();
    ArrayList<Card> cardsList;
    String query;
    Bundle extras;
    String uid;
    Map<String, Object> pricesMap;
    String usd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        recyclerView = findViewById(R.id.recyclerView);
        cardsList = new ArrayList<>();

        extras = getIntent().getExtras();
        uid = null;
        if (extras != null) {
            uid = extras.getString("UID");
            Log.d(TAG, uid);
        }

        // RELOAD BUTTON
        Button reloadButton = findViewById(R.id.reloadButton);
        // Set an OnClickListener to listen for clicks on the button
        reloadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Call a method to restart the activity
                restartActivity();
            }
        });

        // LOGOUT BUTTON
        Button logoutButton = findViewById(R.id.logoutButton);
        // Set an OnClickListener to listen for clicks on the button
        logoutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Call a method to restart the activity
                logout();
            }
        });

        searchView = findViewById(R.id.searchView);

        // Set up a listener for changes in the search query
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                // This method is called when the user submits the query (e.g., presses Enter)
                searchView.clearFocus();
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                ArrayList<Card> filteredCardList = filterCardList(newText);

                setAdapter(filteredCardList); // Call the filter method in your adapter
                return true;
            }
        });

        // Assuming uid is not null
        CollectionReference cardsCollectionRef = db.collection("Users").document(uid)
                .collection("folders").document("All_Cards")
                .collection("cards");


        cardsCollectionRef.get().addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
            @Override
            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                if (task.isSuccessful()) {
                    for (QueryDocumentSnapshot document : task.getResult()) {
                        // card name
                        String cardName = document.getString("name");
                        String cardSet = document.getString("set_code");

                        // card price
                        Object pricesObj = document.getData().get("prices");
                        if (pricesObj instanceof Map) {
                            pricesMap = (Map<String, Object>) pricesObj;
                            usd = (String) pricesMap.get("usd");
                        } else {
                            usd = document.getString("prices");
                        }

                        cardsList.add(new Card(cardName, cardSet, "$" + usd));

                    }
                    // Call setAdapter here after adding all cards to cardsList
                    setAdapter(cardsList);
                } else {
                    Log.d(TAG, "Error getting documents: ", task.getException());
                }
            }
        });

    }

    private void setAdapter(ArrayList<Card> list) {
        recyclerAdapter adapter = new recyclerAdapter(list);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(getApplicationContext());
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setItemAnimator(new DefaultItemAnimator());
        recyclerView.setAdapter(adapter);

    }

    private ArrayList<Card> filterCardList(String text) {
        ArrayList<Card> cardsListFiltered = new ArrayList<>();
        text = text.toLowerCase();

        for (Card card: cardsList) {
            if (card.getCardName().toLowerCase().contains(text)) {
                cardsListFiltered.add(card);
            }
        }
        return cardsListFiltered;
    }
    // Method to restart the activity
    private void restartActivity() {
        Intent intent = getIntent();
        finish(); // Finish the current activity
        startActivity(intent); // Start a new instance of this activity
    }

    private void setCardsInfo() {
        cardsList.add(new Card("function", "tes","12.99"));
    }


    private void logout() {
        Intent intent = new Intent(this, Login.class);
        startActivity(intent);
    }
}
