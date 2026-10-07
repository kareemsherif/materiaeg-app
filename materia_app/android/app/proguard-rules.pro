# Flutter Wrapper & Engine
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }
-keep class io.flutter.embedding.** { *; }

# Prevent obfuscation of android support & google classes
-dontwarn androidx.**
-keep class androidx.** { *; }
-dontwarn com.google.**
-keep class com.google.android.gms.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Suppress generic library warnings
-dontwarn okhttp3.**
-dontwarn okio.**

