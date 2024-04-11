package com.example.scrollrackmobile.ui.mydecks;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class MyDecksViewModel extends ViewModel {

    private final MutableLiveData<String> mText;

    public MyDecksViewModel() {
        mText = new MutableLiveData<>();
        mText.setValue("This is where a user's decks will be managed");
    }

    public LiveData<String> getText() {
        return mText;
    }
}