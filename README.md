You are a senior Android engineer. Build "Max AI" Episode 1 (Foundation) inside this repository. Do the work directly in the repo, commit everything, and make sure the project compiles into a real installable debug APK.

========================================
PROJECT
========================================
App name: Max AI
Package: com.max.assistant
Language: Kotlin
UI: Jetpack Compose + Material 3
minSdk 26, targetSdk 34, compileSdk 34
Gradle: Kotlin DSL (build.gradle.kts), Gradle wrapper included
Architecture: MVVM + Repository, clean modular package structure

========================================
EPISODE 1 SCOPE (only this)
========================================
1. Android Liquid Glass UI
2. Gemini API integration
3. User API Key Settings
4. Basic Text Chat (user message -> Gemini response)
5. Future-ready project structure for later episodes

Do NOT add voice, wake word, accessibility control, overlays, or background services in this episode. Only leave clean extension points for them.

========================================
1) LIQUID GLASS UI
========================================
- Dark gradient background (deep navy/purple to black) with soft blurred color blobs.
- Glass cards: semi-transparent white (alpha 0.08-0.18), 1dp light border, rounded corners 20-28dp, soft shadow.
- Use Modifier.blur only on API 31+ and provide a safe fallback (plain translucent surface) on API 26-30, so the app never crashes on older phones.
- Chat bubbles: user bubble on the right with an accent gradient, AI bubble on the left with a glass look.
- Glass top bar (app name "Max AI" + settings icon) and a glass bottom input bar (text field + send button).
- Smooth animations: message fade/slide in, typing indicator ("Max is thinking...").
- Reusable composables in ui/components: GlassCard, GlassTopBar, GlassTextField, ChatBubble, TypingIndicator.
- Theme in ui/theme (Color, Type, Theme).

========================================
2) GEMINI API INTEGRATION
========================================
- Use plain Retrofit + OkHttp + kotlinx.serialization (or Gson). No heavy SDK required.
- Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
- API key sent via header "x-goog-api-key" (not hardcoded in URL logs).
- Default model: gemini-2.0-flash. Make the model name a constant in one place AND editable in Settings.
- Send the full conversation history (user/model roles) so the chat has context.
- Add a system instruction: "You are Max, a helpful, friendly AI assistant. Reply in the same language the user writes in (Hindi, Hinglish or English)."
- Parse response safely. Handle: empty response, blocked content, no internet, timeout, HTTP 400/401/403/429/500. Show a clear human-readable error message inside the chat, never crash.
- Set connect/read timeouts to 30 seconds.
- Network calls only on Dispatchers.IO via Repository + suspend functions.

========================================
3) USER API KEY SETTINGS
========================================
- Settings screen (glass UI) with:
  - Gemini API key field (password-style, show/hide toggle)
  - Model name field (default gemini-2.0-flash)
  - Save button, Clear key button
  - "Test connection" button that sends a small test request and shows success or the exact error
  - Link/text: "Get a free key at aistudio.google.com/apikey"
- Store the key using EncryptedSharedPreferences (androidx.security:security-crypto). If it fails on a device, fall back to normal DataStore so the app still works.
- Never hardcode any API key in code, BuildConfig or the repo. Never log the key.
- If no key is saved, the chat screen shows a friendly glass card: "Add your Gemini API key in Settings to start chatting" with a button that opens Settings.
- Navigation between Chat and Settings using Navigation Compose.

========================================
4) BASIC TEXT CHAT
========================================
- ChatScreen with a LazyColumn, auto-scroll to the latest message.
- Flow: user types -> message appears instantly -> typing indicator -> Gemini reply appears.
- Disable the send button while a request is running and when the input is empty.
- Keep chat history in memory in the ViewModel with StateFlow (UiState: messages, isLoading, error). Rotation must not lose the chat.
- "Clear chat" action in the top bar.
- Long-press a message to copy it.
- Keyboard handling: imePadding so the input bar is never hidden.

========================================
5) FUTURE-READY STRUCTURE
========================================
com.max.assistant/
  MaxApplication.kt
  MainActivity.kt
  core/        (constants, Result wrapper, dispatchers)
  data/
    remote/    (GeminiApi, DTOs, RetrofitProvider)
    local/     (SecureKeyStore / SettingsStore)
    repository/(ChatRepository, SettingsRepository)
  domain/
    model/     (ChatMessage, Role)
  ui/
    theme/
    components/
    chat/      (ChatScreen, ChatViewModel, ChatUiState)
    settings/  (SettingsScreen, SettingsViewModel)
    navigation/(MaxNavGraph)
  features/    (EMPTY placeholder packages with a README.md inside each: voice/, automation/, memory/, tools/ - for future episodes)

Also add a top-level docs/ROADMAP.md listing future episodes (voice, memory, device control, tools) as "planned, not implemented".

========================================
APK INSTALL COMPATIBILITY (VERY IMPORTANT - NO INSTALL PROBLEMS)
========================================
The APK must install cleanly on normal phones. Therefore:
- Build a DEBUG APK (it is automatically signed with the standard Android debug key, so it installs without a signing error). Do NOT produce an unsigned release APK.
- Do not use a custom keystore for this episode.
- minSdk 26 so it installs on almost all current devices.
- Do not use android:testOnly="true" anywhere (it blocks installation). Do not use extractNativeLibs hacks or unusual manifest flags.
- Permissions: only INTERNET and ACCESS_NETWORK_STATE.
- Do not restrict ABIs (no abiFilters), so the APK works on arm64-v8a, armeabi-v7a and x86_64 devices.
- Manifest must have a valid launcher activity (MAIN + LAUNCHER) with android:exported="true".
- Provide proper launcher icons (adaptive icon: ic_launcher and ic_launcher_round) so the install does not fail on missing resources.
- Enable usesCleartextTraffic = false (all traffic is HTTPS).
- ProGuard/R8 minify OFF for debug.
- After the build, verify the APK with: aapt dump badging (package name, versionCode, launchable-activity) and apksigner verify, and print the results in the build log.

========================================
BUILD THE REAL APK (CRITICAL RULES)
========================================
Please build a real installable debug APK for this Android app.

- Do NOT manually create an empty APK file.
- Do NOT create a placeholder file.
- Do NOT create a 0B file.
- Use the real Android build process (./gradlew assembleDebug) to compile the project and generate a valid debug APK.
- After the APK is generated, include the real APK inside the downloadable project ZIP.
- Place one copy of the real APK here:
  build-outputs/app-debug.apk
- Also create a normal easy-to-find folder called:
  APK DOWNLOAD
  and copy the same real APK into:
  APK DOWNLOAD/app-debug.apk
- The APK file must be greater than 1 MB. If it is smaller, fail the build and report the error.
- If the build fails, fix the code and rebuild until it succeeds. Do not fake or skip the APK.

========================================
GITHUB ACTIONS (AUTO APK BUILD + RELEASE)
========================================
Create .github/workflows/build-apk.yml:
- Triggers: push to main, pull_request, and workflow_dispatch.
- Runner: ubuntu-latest, JDK 17 (actions/setup-java, temurin), Android SDK via android-actions/setup-android, Gradle cache enabled.
- Steps: checkout -> chmod +x gradlew -> ./gradlew assembleDebug --stacktrace -> locate app/build/outputs/apk/debug/app-debug.apk.
- Verify the file exists AND size > 1 MB (fail the job otherwise).
- Copy to build-outputs/app-debug.apk and "APK DOWNLOAD/app-debug.apk".
- Upload as artifact (actions/upload-artifact) named "Max-AI-debug-apk" containing the APK.
- On push to main, also create/update a GitHub Release (tag: v1.0.<run_number>) and attach app-debug.apk (use softprops/action-gh-release, permissions: contents: write).
- Commit the generated gradle wrapper files (gradlew, gradlew.bat, gradle/wrapper/*) to the repo so CI works.

========================================
CODE QUALITY
========================================
- Zero compile errors, zero placeholder TODO that breaks the build.
- Use a version catalog (gradle/libs.versions.toml) with stable, compatible versions (AGP 8.x, Kotlin 1.9.x/2.0.x matching Compose compiler, Compose BOM).
- Add .gitignore (build/, .gradle/, local.properties, *.iml, .idea/) - but do NOT ignore build-outputs/ or "APK DOWNLOAD/".
- Add a clear README.md: what Max AI is, how to get a Gemini key, how to install the APK, how to build.

========================================
ANALYSIS (write this in docs/ANALYSIS.md and print a summary at the end)
========================================
Before coding, analyze and document:
1. Install compatibility: minSdk/targetSdk choice, signing method, permissions, ABI support, and why this APK will install without errors.
2. Gemini response: request/response format, system instruction, history handling, error cases and how each is shown to the user.
3. Future-ready structure: how each future episode (voice, memory, device control, tools) plugs into the current packages without rewriting existing code.
4. Risks and how they were handled (old Android blur fallback, missing API key, no internet, rate limit).

========================================
FINAL OUTPUT CHECKLIST
========================================
At the end, confirm each item with YES/NO:
[ ] Project compiles with ./gradlew assembleDebug
[ ] Real APK generated (size in MB printed)
[ ] build-outputs/app-debug.apk exists and > 1 MB
[ ] APK DOWNLOAD/app-debug.apk exists and > 1 MB
[ ] aapt badging and apksigner verify passed
[ ] GitHub Actions workflow added and Release step configured
[ ] README.md and docs/ANALYSIS.md written
Then give the repo-ready file list and short install steps.
