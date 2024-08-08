package com.example.rsecktor.Auth;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.rsecktor.R;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.JSONObject;

import java.io.IOException;
import java.util.Random;

public class AuthActivity extends AppCompatActivity {
    private static final String PHONE_PREF_KEY = "phoneEditText";
    private static final String PREFS_NAME = "MyPrefs";
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    private String apiUrl;

    @SuppressLint("ResourceType")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#3A2A5A"));
        setContentView(R.layout.auth);

        apiUrl = getString(R.string.server) + "/sendAuthCode";

        EditText phoneEditText = findViewById(R.id.phoneEditTextAuth);
        Button savePhoneButton = findViewById(R.id.buttonContinue);

        savePhoneButton.setOnClickListener(v -> {
            String phoneNumber = phoneEditText.getText().toString().trim();
            if (phoneNumber.isEmpty()) {
                Toast.makeText(AuthActivity.this, "Пожалуйста, введите номер телефона", Toast.LENGTH_SHORT).show();
            } else {
                String authCode = generateAuthCode();
                savePhoneNumber(phoneNumber, authCode);
                sendAuthCodeToServer(phoneNumber, authCode);
            }
        });
    }

    private void savePhoneNumber(String phoneNumber, String authCode) {
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(PHONE_PREF_KEY, phoneNumber);
        editor.putString("authCode", authCode);
        editor.apply();
    }

    @NonNull
    private String generateAuthCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    private void sendAuthCodeToServer(String phoneNumber, String code) {
        OkHttpClient client = new OkHttpClient();
        JSONObject json = new JSONObject();
        try {
            json.put("phoneNumber", phoneNumber);
            json.put("code", code);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

        RequestBody body = RequestBody.create(JSON, json.toString());
        Request request = new Request.Builder()
                .url(apiUrl)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(AuthActivity.this, "Ошибка отправки кода", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                    runOnUiThread(() -> {
                        Intent intent = new Intent(AuthActivity.this, CheckAuthActivity.class);
                        startActivity(intent);
                        finish();
                    });
            }
        });
    }
}