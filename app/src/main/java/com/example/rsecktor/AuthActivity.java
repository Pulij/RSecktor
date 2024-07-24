package com.example.rsecktor;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class AuthActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#3A2A5A"));
        setContentView(R.layout.auth);

        @SuppressLint({"MissingInflatedId", "LocalSuppress"}) EditText phoneEditText = findViewById(R.id.phoneEditTextAuth);
        @SuppressLint({"MissingInflatedId", "LocalSuppress"}) Button savePhoneButton = findViewById(R.id.buttonContinue);

        savePhoneButton.setOnClickListener(v -> {
            String phoneNumber = phoneEditText.getText().toString().trim();

            if (phoneNumber.isEmpty()) {
                Toast.makeText(AuthActivity.this, "Пожалуйста, введите номер телефона", Toast.LENGTH_SHORT).show();
            } else {
                SharedPreferences sharedPreferences = getSharedPreferences("MyPrefs", MODE_PRIVATE);
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putString("phoneEditText", phoneNumber);
                editor.apply();

                Intent intent = new Intent(AuthActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }
}