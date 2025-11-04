# Keep Firebase and Google Play Services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class com.google.firestore.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
