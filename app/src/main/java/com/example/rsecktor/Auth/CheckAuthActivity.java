package com.example.rsecktor.Auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.example.rsecktor.MainActivity;
import com.example.rsecktor.R;

public class CheckAuthActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "MyPrefs";
    private static final String AUTH_CODE_KEY = "authCode";
    private static final String ATTEMPTS_KEY = "attempts";
    private static final String LAST_ATTEMPT_TIME_KEY = "lastAttemptTime";
    private static final int MAX_ATTEMPTS = 5;
    private static final long HOUR_IN_MILLIS = 3600000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#3A2A5A"));
        setContentView(R.layout.auth_check);

        EditText codeEditText = findViewById(R.id.phoneEditTextAuth);
        Button continueButton = findViewById(R.id.buttonContinue);

        continueButton.setOnClickListener(v -> {
            String enteredCode = codeEditText.getText().toString().trim();

            if (enteredCode.isEmpty()) {
                Toast.makeText(CheckAuthActivity.this, "Пожалуйста, введите код", Toast.LENGTH_SHORT).show();
                return;
            }

            SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            long lastAttemptTime = sharedPreferences.getLong(LAST_ATTEMPT_TIME_KEY, 0);
            int attempts = sharedPreferences.getInt(ATTEMPTS_KEY, 0);
            long currentTime = System.currentTimeMillis();

            if (currentTime - lastAttemptTime >= HOUR_IN_MILLIS) attempts = 0;

            if (attempts >= MAX_ATTEMPTS) {
                Toast.makeText(CheckAuthActivity.this, "Превышено количество попыток. Попробуйте через час.", Toast.LENGTH_SHORT).show();
                return;
            }

            String savedCode = sharedPreferences.getString(AUTH_CODE_KEY, "");

            if (enteredCode.equals(savedCode)) {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putBoolean("firstLaunch", false);
                editor.putInt(ATTEMPTS_KEY, 0);
                editor.apply();
                Intent intent = new Intent(CheckAuthActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            } else {
                attempts++;
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putInt(ATTEMPTS_KEY, attempts);
                editor.putLong(LAST_ATTEMPT_TIME_KEY, currentTime);
                editor.apply();
                Toast.makeText(CheckAuthActivity.this, "Неверный код, осталось " + (MAX_ATTEMPTS - attempts) + " попыток", Toast.LENGTH_SHORT).show();
            }
        });
    }
}