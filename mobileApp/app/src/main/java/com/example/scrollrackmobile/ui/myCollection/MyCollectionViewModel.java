package com.example.scrollrackmobile.ui.myCollection;

import static android.content.ContentValues.TAG;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;


public class MyCollectionViewModel extends ViewModel {

    FirebaseFirestore db = FirebaseFirestore.getInstance();
    private final MutableLiveData<String> mText;

    public MyCollectionViewModel() {
        mText = new MutableLiveData<>();
//        mText.setValue("This is where a user's collection would be accessed");

//        db.collection("Users/GURJcHSTqGTNgj2kAKTh0pZwiwu2/folders/All_Cards/cards/LLjWcyS8KHPQpKALcV1R")
        DocumentReference docRef = db.collection("Users").document("/SuyA7vmjvdWSSgeunFmMPcPwqaG3/folders/All_Cards/cards/6jK9nx7DafFUcVnqbAfZ");
        docRef.get().addOnCompleteListener(new OnCompleteListener<DocumentSnapshot>() {
            @Override
            public void onComplete(@NonNull Task<DocumentSnapshot> task) {
                if (task.isSuccessful()) {
                    DocumentSnapshot document = task.getResult();
                    if (document.exists()) {
                        String fieldValue = document.getString("name");
                        mText.setValue(fieldValue);
                    } else {
                        Log.d(TAG, "No such document");
                    }
                } else {
                    Log.d(TAG, "get failed with ", task.getException());
                }
            }
        });
    }

    public LiveData<String> getText() {
        return mText;
    }
}