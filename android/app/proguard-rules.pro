# ProGuard & R8 configuration for T-Ebook (com.ntt.tebook)

# Preserve source file and line numbers for crash analysis
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Preserve runtime annotations and reflection metadata
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes JavascriptInterface

# Keep Capacitor Bridge & Core
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep public interface com.getcapacitor.** { *; }

# Keep methods called via reflection / JS bridge
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.PermissionCallback <methods>;
}

# Keep Application package classes
-keep public class com.ntt.tebook.** { *; }

# Keep Android WebKit & WebView interaction
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
    public boolean *(android.webkit.WebView, java.lang.String, java.lang.String, android.webkit.JsResult);
}

# Keep Cordova plugins if registered
-keep public class org.apache.cordova.** { *; }
-keep public class * extends org.apache.cordova.CordovaPlugin { *; }

# Keep Material Design 3 and AndroidX Splashscreen components
-keep class com.google.android.material.** { *; }
-keep class androidx.core.splashscreen.** { *; }

# Suppress known harmless warnings from optional dependencies
-dontwarn com.google.android.gms.**
-dontwarn org.apache.cordova.**
