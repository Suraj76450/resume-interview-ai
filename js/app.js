// DOM Element Selectors
const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");
const statusText = document.getElementById("statusText");
const chatBox = document.getElementById("chatBox");
const autoMicToggle = document.getElementById("autoMicToggle");
const realTimeSyncToggle = document.getElementById("realTimeSyncToggle");
const answerInput = document.getElementById("answerInput");
const startBtn = document.getElementById("startBtn");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const repeatBtn = document.getElementById("repeatBtn");
const endBtn = document.getElementById("endBtn");
const resetBtn = document.getElementById("resetBtn");
const helperText = document.getElementById("helperText");
const errorText = document.getElementById("errorText");

// Settings & Config Panel selectors
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const apiKeyInput = document.getElementById("apiKeyInput");
const toggleShowKeyBtn = document.getElementById("toggleShowKeyBtn");
const eyeIcon = document.getElementById("eyeIcon");
const apiKeyStatus = document.getElementById("apiKeyStatus");
const questionCountSelect = document.getElementById("questionCountSelect");

// API Key Modal selectors
const apiKeyModal = document.getElementById("apiKeyModal");
const modalApiKeyInput = document.getElementById("modalApiKeyInput");
const closeApiKeyModalBtn = document.getElementById("closeApiKeyModalBtn");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");

// Dashboard Widgets selectors
const turnCounter = document.getElementById("turnCounter");
const progressBar = document.getElementById("progressBar");
const timerDisplay = document.getElementById("timerDisplay");

// Sound Wave selector
const soundWaveContainer = document.getElementById("soundWaveContainer");
const soundWaveLabel = document.getElementById("soundWaveLabel");

// Job Role & Webcam selectors
const jobTitleInput = document.getElementById("jobTitleInput");
const jobDescInput = document.getElementById("jobDescInput");
const experienceSelect = document.getElementById("experienceSelect");
const toggleWebcamBtn = document.getElementById("toggleWebcamBtn");
const webcamVideo = document.getElementById("webcamVideo");
const webcamPlaceholder = document.getElementById("webcamPlaceholder");
const webcamLiveIndicator = document.getElementById("webcamLiveIndicator");
let webcamStream = null;

// Report Modal selectors
const reportCardModal = document.getElementById("reportCardModal");
const closeReportBtn = document.getElementById("closeReportBtn");
const downloadTranscriptBtn = document.getElementById("downloadTranscriptBtn");
const feedbackOverview = document.getElementById("feedbackOverview");
const feedbackStrengths = document.getElementById("feedbackStrengths");
const feedbackWeaknesses = document.getElementById("feedbackWeaknesses");
const feedbackTopics = document.getElementById("feedbackTopics");

// Config Constants
const DEFAULT_GEMINI_API_KEY = "";
const GEMINI_MODELS = ["gemini-1.5-flash"];
const GEMINI_TTS_VOICE = "Kore";
const LiveSpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
const MEDIA_RECORDER_SUPPORTED =
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices &&
  !!navigator.mediaDevices.getUserMedia &&
  typeof MediaRecorder !== "undefined";

// State Variables
let resumeText = "";
let interviewStarted = false;
let interviewMode = "friendly";
let interviewTurn = 0;
let conversationHistory = [];
let isListening = false;
let speechEnabled = "speechSynthesis" in window;
let selectedVoice = null;
let shouldSubmitAfterListening = false;
let selectedResumeFile = null;
let resumeMimeType = "";
let resumeFileBase64 = "";
let lastQuestionSpoken = "";
let mediaRecorder = null;
let recordedChunks = [];
let recordedMimeType = "";
let currentAudio = null;
let liveRecognition = null;
let liveTranscriptFinal = "";
let liveTranscriptInterim = "";
let liveTranscriptSnapshot = "";
let recordingStartedAt = 0;
let lastSpeechActivityAt = 0;
let hesitationWatchTimer = null;
let isInterviewerSpeaking = false;
let currentRenderToken = 0;

// Pointer to the active real-time speech bubble for candidate
let activeUserBubble = null;

// Track if SpeechRecognition is actively started
let isRecognitionActive = false;
let suppressNextRecognitionEnd = false;

// Sentence cancellation and sequential speech states
let endRequested = false;

// Real-time chunked audio transcription variables
let realTimeInterval = null;
let isIntervalTranscribing = false;

// Session Stopwatch Timer states
let timerInterval = null;
let secondsElapsed = 0;

// Initialize app config
initTheme();
initApiKey();
syncFileSelectionUI();
handleAutoLoadedFile();

// Hook Job Role & Webcam input events
if (jobTitleInput) jobTitleInput.addEventListener("input", updateStartAvailability);
if (jobDescInput) jobDescInput.addEventListener("input", updateStartAvailability);
if (experienceSelect) experienceSelect.addEventListener("change", updateStartAvailability);

if (toggleWebcamBtn) {
  toggleWebcamBtn.addEventListener("click", async () => {
    if (webcamStream) {
      stopWebcam();
    } else {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamVideo) {
          webcamVideo.srcObject = webcamStream;
          webcamVideo.style.display = "block";
        }
        if (webcamPlaceholder) webcamPlaceholder.style.display = "none";
        if (webcamLiveIndicator) webcamLiveIndicator.style.display = "flex";
        toggleWebcamBtn.textContent = "📷 Stop Camera";
        toggleWebcamBtn.classList.add("listening");
      } catch (error) {
        console.error("Failed to open webcam:", error);
        alert("Could not access camera. Check your permissions.");
      }
    }
  });
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }
  if (webcamVideo) {
    webcamVideo.srcObject = null;
    webcamVideo.style.display = "none";
  }
  if (webcamPlaceholder) webcamPlaceholder.style.display = "flex";
  if (webcamLiveIndicator) webcamLiveIndicator.style.display = "none";
  if (toggleWebcamBtn) {
    toggleWebcamBtn.textContent = "📷 Start Camera";
    toggleWebcamBtn.classList.remove("listening");
  }
}

// ----------------------------------------------------
// Theme & Settings Handlers
// ----------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem("resume_interview_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeIcon.innerHTML = `<path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-10a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1Zm0 14a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1ZM5.64 6.64a1 1 0 0 0 1.41-1.41l-.7-.71a1 1 0 0 0-1.41 1.41ZM18.36 17.36a1 1 0 0 0-1.41 1.41l.7.71a1 1 0 0 0 1.41-1.41ZM3 11h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Zm17 0h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2ZM6.34 17.66l-.7.71a1 1 0 0 0 1.41 1.41l.7-.71a1 1 0 0 0-1.41-1.41ZM17.66 6.34l.7-.71a1 1 0 0 0-1.41-1.41l-.7.71a1 1 0 0 0 1.41 1.41Z"/>`;
  } else {
    document.body.classList.remove("light-theme");
    themeIcon.innerHTML = `<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.38 5.38 0 0 1-4.4 2.26 5.4 5.4 0 0 1-5.14-5.14c0-1.85 1.05-3.46 2.6-4.28A9 9 0 0 0 12 3Z"/>`;
  }
}

themeToggleBtn.addEventListener("click", () => {
  if (document.body.classList.contains("light-theme")) {
    document.body.classList.remove("light-theme");
    localStorage.setItem("resume_interview_theme", "dark");
    themeIcon.innerHTML = `<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.38 5.38 0 0 1-4.4 2.26 5.4 5.4 0 0 1-5.14-5.14c0-1.85 1.05-3.46 2.6-4.28A9 9 0 0 0 12 3Z"/>`;
  } else {
    document.body.classList.add("light-theme");
    localStorage.setItem("resume_interview_theme", "light");
    themeIcon.innerHTML = `<path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-10a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1Zm0 14a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1ZM5.64 6.64a1 1 0 0 0 1.41-1.41l-.7-.71a1 1 0 0 0-1.41 1.41ZM18.36 17.36a1 1 0 0 0-1.41 1.41l.7.71a1 1 0 0 0 1.41-1.41ZM3 11h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Zm17 0h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2ZM6.34 17.66l-.7.71a1 1 0 0 0 1.41 1.41l.7-.71a1 1 0 0 0-1.41-1.41ZM17.66 6.34l.7-.71a1 1 0 0 0-1.41-1.41l-.7.71a1 1 0 0 0 1.41 1.41Z"/>`;
  }
});

function initApiKey() {
  const savedKey = localStorage.getItem("resume_interview_user_api_key") || "";
  apiKeyInput.value = savedKey;

  if (savedKey) {
    apiKeyStatus.textContent = "Custom API key active.";
    apiKeyStatus.style.color = "var(--brand)";
  } else {
    apiKeyStatus.textContent = "Offline practice mode. Add a key for Gemini.";
    apiKeyStatus.style.color = "var(--text-muted)";
  }

  toggleShowKeyBtn.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      eyeIcon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/> <path d="M2 2l20 20" stroke="currentColor" stroke-width="2"/>`;
    } else {
      apiKeyInput.type = "password";
      eyeIcon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>`;
    }
  });

  apiKeyInput.addEventListener("input", () => {
    const keyVal = apiKeyInput.value.trim();
    if (keyVal) {
      localStorage.setItem("resume_interview_user_api_key", keyVal);
      apiKeyStatus.textContent = "Custom API key active.";
      apiKeyStatus.style.color = "var(--brand)";
    } else {
      localStorage.removeItem("resume_interview_user_api_key");
      apiKeyStatus.textContent = "Offline practice mode. Add a key for Gemini.";
      apiKeyStatus.style.color = "var(--text-muted)";
    }
    updateStartAvailability();
  });

  // Modal Setup Listeners
  if (closeApiKeyModalBtn) {
    closeApiKeyModalBtn.addEventListener("click", () => {
      apiKeyModal.classList.remove("active");
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener("click", () => {
      const keyVal = modalApiKeyInput.value.trim();
      if (keyVal) {
        localStorage.setItem("resume_interview_user_api_key", keyVal);
        apiKeyInput.value = keyVal;
        apiKeyStatus.textContent = "Custom API key active.";
        apiKeyStatus.style.color = "var(--brand)";
        apiKeyModal.classList.remove("active");
        // Auto-trigger interview start!
        startBtn.click();
      } else {
        alert("Please paste a valid Gemini API key.");
      }
    });
  }
}

function getApiKey() {
  const userKey = localStorage.getItem("resume_interview_user_api_key");
  if (userKey && userKey.trim()) {
    return userKey.trim();
  }
  return DEFAULT_GEMINI_API_KEY.trim();
}



// ----------------------------------------------------
// UI Sync, Timer & Progress Tracker Helpers
// ----------------------------------------------------
function syncFileSelectionUI() {
  const selectedName = resumeFile.files && resumeFile.files[0] ? resumeFile.files[0].name : "";
  setSelectedFileLabel(selectedName);
}

async function handleAutoLoadedFile() {
  if (resumeFile.files && resumeFile.files.length > 0) {
    const file = resumeFile.files[0];
    selectedResumeFile = file;
    resumeMimeType = file.type || guessMimeType(file.name);
    resumeFileBase64 = "";
    setSelectedFileLabel(file.name);
    statusText.textContent = "Reading resume...";
    startBtn.disabled = true;

    try {
      if (resumeMimeType === "application/pdf") {
        resumeFileBase64 = await fileToBase64(file);
      }

      resumeText = await readResumeText(file);

      if (!resumeFileBase64) {
        resumeFileBase64 = await fileToBase64(file);
      }

      if (!resumeText.trim()) {
        if (canSendResumeInline()) {
          statusText.textContent = "Resume uploaded. Gemini will read the file directly.";
          errorText.textContent = "";
          setSelectedFileLabel(file.name);
          updateStartAvailability();
          return;
        }
        throw new Error("The resume seems empty after reading.");
      }

      errorText.textContent = "";
      updateStartAvailability();
    } catch (error) {
      if (resumeMimeType === "application/pdf" && !resumeFileBase64) {
        try {
          resumeFileBase64 = await fileToBase64(file);
        } catch (base64Error) {}
      }

      if (canSendResumeInline()) {
        resumeText = "";
        errorText.textContent = "";
        statusText.textContent = "Resume uploaded. Gemini will read the file directly.";
        setSelectedFileLabel(file.name);
        updateStartAvailability();
        return;
      }

      clearResumeState(false);
      errorText.textContent = error.message || "Could not read resume.";
      statusText.textContent = "Resume could not be loaded.";
      setSelectedFileLabel(file.name);
    }
  }
}

function setSelectedFileLabel(name) {
  fileName.textContent = name ? `Selected: ${name}` : "";
}

function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  timerDisplay.textContent = "00:00";
  timerInterval = setInterval(() => {
    secondsElapsed += 1;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const secs = String(secondsElapsed % 60).padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getMaxQuestions() {
  if (typeof questionCountSelect !== "undefined" && questionCountSelect) {
    return parseInt(questionCountSelect.value) || 5;
  }
  return 5;
}

function updateProgress(turn) {
  if (!interviewStarted) {
    turnCounter.textContent = "Not Started";
    progressBar.style.width = "0%";
    return;
  }
  const maxQ = getMaxQuestions();
  const cappedTurn = Math.min(Math.max(turn, 1), maxQ);
  turnCounter.textContent = `Question ${cappedTurn} of ${maxQ}`;
  const pct = maxQ > 1 ? ((cappedTurn - 1) / (maxQ - 1)) * 100 : 100;
  progressBar.style.width = `${pct}%`;
}

function setSoundWaveActive(active, text = "") {
  if (active) {
    soundWaveContainer.classList.add("active");
    soundWaveLabel.textContent = text;
  } else {
    soundWaveContainer.classList.remove("active");
  }
}

// ----------------------------------------------------
// Input Field Mechanics (Hybrid Mode)
// ----------------------------------------------------
answerInput.addEventListener("input", () => {
  if (interviewStarted && !isInterviewerSpeaking) {
    sendBtn.disabled = !answerInput.value.trim();
  }
});

function setHelperText(message) {
  if (helperText) {
    helperText.textContent = message;
  }
}

function syncVoiceButtonLabel() {
  if (isListening) {
    return;
  }

  micBtn.textContent = isVoiceCaptureAvailable() ? "Speak Answer" : "Voice Not Supported";
}

// ----------------------------------------------------
// Live Speech Recognition & Audio Setup
// ----------------------------------------------------
if (!isVoiceCaptureAvailable()) {
  micBtn.disabled = true;
  micBtn.textContent = "Voice Not Supported";
}

if (LiveSpeechRecognitionClass) {
  liveRecognition = new LiveSpeechRecognitionClass();
  liveRecognition.lang = "en-US";
  liveRecognition.interimResults = true;
  liveRecognition.continuous = true;

  liveRecognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        liveTranscriptFinal += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    liveTranscriptInterim = interimTranscript;
    const combined = (liveTranscriptFinal + interimTranscript).trim();

    if (combined) {
      lastSpeechActivityAt = Date.now();
      liveTranscriptSnapshot = combined;
      answerInput.value = combined;
      
      // Enable Send Answer when transcribed text is populated
      if (interviewStarted && !isInterviewerSpeaking) {
        sendBtn.disabled = false;
      }
    }
  };

  liveRecognition.onstart = () => {
    isRecognitionActive = true;
  };
  liveRecognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    
    // Check for critical browser SpeechRecognition errors (like network or blocked mic)
    if (event.error === "network" || event.error === "service-not-allowed" || event.error === "not-allowed") {
      // Stop SpeechRecognition completely
      isListening = false;
      suppressNextRecognitionEnd = true;
      stopLiveRecognition();
      
      // Clean up active real-time speech bubble
      if (activeUserBubble) {
        activeUserBubble.remove();
        activeUserBubble = null;
      }

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        statusText.textContent = "Microphone permission is blocked.";
        errorText.textContent = "Allow microphone access, or type your answer and click Send Answer.";
        setHelperText("Automatic captions need microphone permission. After allowing it, click Speak Answer again.");
        resetVoiceControlsAfterFailure();
        return;
      }

      if (!canTranscribeRecordedAudio()) {
        statusText.textContent = "Live captions need a supported speech engine.";
        errorText.textContent = "";
        setHelperText("For automatic live text, open this localhost app in Chrome/Edge with microphone access, or add a Gemini API key for recorded-audio transcription.");
        resetVoiceControlsAfterFailure();
        return;
      }
      
      statusText.textContent = "Real-time sync unavailable. Recording audio...";
      errorText.textContent = "";
      setHelperText("Recording fallback is active. With Gemini key enabled, your transcript preview updates in short chunks.");

      // Fallback: Trigger standard MediaRecorder recording flow directly.
      startMediaRecorderFallback();
      return;
    }
    
    // Reset UI state for other non-critical errors
    isListening = false;
    micBtn.textContent = "Speak Answer";
    micBtn.classList.remove("listening");
    setSoundWaveActive(false);
    if (activeUserBubble) {
      activeUserBubble.remove();
      activeUserBubble = null;
    }
    statusText.textContent = "Voice capture stopped. Type your answer or try again.";
    setHelperText("Speak again, or type your answer and click Send Answer.");
  };
  liveRecognition.onend = async () => {
    isRecognitionActive = false;
    if (suppressNextRecognitionEnd) {
      suppressNextRecognitionEnd = false;
      return;
    }

    if (isListening) {
      try {
        startLiveRecognition();
      } catch (error) {
        // already started
      }
    } else {
      // Done listening (user clicked Stop Speaking)
      micBtn.textContent = "Speak Answer";
      micBtn.classList.remove("listening");
      setSoundWaveActive(false);
      
      const finalAnswer = answerInput.value.trim();
      
      if (finalAnswer) {
        const humanizedAnswer = cleanFillerWordsLocal(finalAnswer);
        answerInput.value = humanizedAnswer;
        
        if (activeUserBubble) {
          activeUserBubble.textContent = humanizedAnswer;
          chatBox.scrollTop = chatBox.scrollHeight;
        }

        if (shouldSubmitAfterListening) {
          statusText.textContent = "Sending answer...";
          setHelperText("Answer captured from live speech. Sending it now...");
          shouldSubmitAfterListening = false;
          await submitAnswer();
        }
      } else {
        if (activeUserBubble) {
          activeUserBubble.remove();
          activeUserBubble = null;
        }
        statusText.textContent = "No clear answer captured. Try speaking again.";
        setHelperText("Speak clearly after clicking Speak Answer, or type your answer.");
      }
    }
  };
}

// ----------------------------------------------------
// DOM Events Bindings
// ----------------------------------------------------
document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    interviewMode = document.querySelector('input[name="mode"]:checked').value;
  });
});

// Restore saved question count setting
const savedQCount = localStorage.getItem("resume_interview_question_count") || "5";
if (questionCountSelect) {
  questionCountSelect.value = savedQCount;
  questionCountSelect.addEventListener("change", () => {
    localStorage.setItem("resume_interview_question_count", questionCountSelect.value);
    if (interviewStarted) {
      updateProgress(interviewTurn);
    }
  });
}

micBtn.addEventListener("click", () => {
  if (!isVoiceCaptureAvailable()) {
    errorText.textContent = "";
    setHelperText("This browser cannot provide live captions. Open http://127.0.0.1:4173 in Chrome/Edge, or add a Gemini API key in a browser with microphone recording.");
    return;
  }

  if (!interviewStarted) {
    errorText.textContent = "Start the interview first.";
    return;
  }

  if (isListening) {
    const shouldStopRecording = window.confirm(
      "You are still answering. Do you want to stop now and submit whatever has been captured?"
    );

    if (!shouldStopRecording) {
      return;
    }

    stopListening();
    return;
  }

  if (isInterviewerSpeaking) {
    const shouldInterruptQuestion = window.confirm(
      "The interviewer is still speaking. Do you want to stop the current question and start your answer now?"
    );

    if (!shouldInterruptQuestion) {
      return;
    }

    cancelInterviewerSpeech();
  }

  errorText.textContent = "";
  answerInput.value = "";
  startVoiceCapture();
});

repeatBtn.addEventListener("click", async () => {
  if (!lastQuestionSpoken.trim()) {
    errorText.textContent = "No interviewer question is available to repeat yet.";
    return;
  }

  if (isInterviewerSpeaking) {
    const shouldRestartQuestion = window.confirm(
      "The interviewer is already speaking. Do you want to restart the question from the beginning?"
    );

    if (!shouldRestartQuestion) {
      return;
    }

    cancelInterviewerSpeech();
  }

  errorText.textContent = "";
  await presentInterviewerMessage(lastQuestionSpoken);
});

resumeFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  errorText.textContent = "";
  syncFileSelectionUI();

  if (!file) {
    clearResumeState();
    resetChat();
    return;
  }

  selectedResumeFile = file;
  resumeMimeType = file.type || guessMimeType(file.name);
  resumeFileBase64 = "";
  setSelectedFileLabel(file.name);
  statusText.textContent = "Reading resume...";
  startBtn.disabled = true;

  try {
    if (resumeMimeType === "application/pdf") {
      resumeFileBase64 = await fileToBase64(file);
    }

    resumeText = await readResumeText(file);

    if (!resumeFileBase64) {
      resumeFileBase64 = await fileToBase64(file);
    }

    if (!resumeText.trim()) {
      if (canSendResumeInline()) {
        statusText.textContent = "Resume uploaded. Gemini will read the file directly.";
        errorText.textContent = "";
        setSelectedFileLabel(file.name);
        updateStartAvailability();
        return;
      }

      throw new Error("The resume seems empty after reading.");
    }

    errorText.textContent = "";
    updateStartAvailability();
  } catch (error) {
    if (resumeMimeType === "application/pdf" && !resumeFileBase64) {
      try {
        resumeFileBase64 = await fileToBase64(file);
      } catch (base64Error) {}
    }

    if (canSendResumeInline()) {
      resumeText = "";
      errorText.textContent = "";
      statusText.textContent = "Resume uploaded. Gemini will read the file directly.";
      setSelectedFileLabel(file.name);
      updateStartAvailability();
      return;
    }

    clearResumeState(false);
    errorText.textContent = error.message || "Could not read resume.";
    statusText.textContent = "Resume could not be loaded.";
    setSelectedFileLabel(file.name);
  }
});

startBtn.addEventListener("click", async () => {
  if (!hasResumeReady()) {
    errorText.textContent = "Upload a TXT, PDF, or DOCX resume first.";
    return;
  }

  errorText.textContent = "";
  interviewStarted = true;
  interviewTurn = 1;
  conversationHistory = [];
  endRequested = false;
  resetChat();
  startTimer();
  updateProgress(1);

  startBtn.disabled = true;
  sendBtn.disabled = true;
  micBtn.disabled = true;
  endBtn.disabled = false;
  answerInput.disabled = false;
  answerInput.value = "";
  statusText.textContent = "Starting interview...";

  addMessage("system", "Interview started. The interviewer is preparing the first resume-based question.");
  if (!getApiKey()) {
    addMessage("system", "Offline practice mode is active. Add a Gemini API key for fully AI-generated questions and feedback.");
  }

  try {
    const firstQuestion = await generateInterviewerReply(true);
    await presentInterviewerMessage(firstQuestion);
    conversationHistory.push({ role: "assistant", text: firstQuestion });
    lastQuestionSpoken = firstQuestion;

    answerInput.disabled = false;
    sendBtn.disabled = true; // Disable until user types or speaks
    micBtn.disabled = !isVoiceCaptureAvailable();
    repeatBtn.disabled = false;
    statusText.textContent = "Interview in progress.";
  } catch (error) {
    interviewStarted = false;
    stopTimer();
    updateProgress(0);
    startBtn.disabled = false;
    endBtn.disabled = true;
    answerInput.disabled = true;
    sendBtn.disabled = true;
    micBtn.disabled = true;
    repeatBtn.disabled = true;
    statusText.textContent = "Interview failed to start.";
    errorText.textContent = error.message || "Could not start interview.";
  }
});

sendBtn.addEventListener("click", async () => {
  await submitAnswer();
});

endBtn.addEventListener("click", async () => {
  if (!interviewStarted) {
    return;
  }

  if (isListening) {
    const shouldEndNow = window.confirm(
      "You are still answering. Do you want to stop your answer and end the interview now?"
    );

    if (!shouldEndNow) {
      return;
    }
  }

  if (isInterviewerSpeaking) {
    // If AI is speaking, register request. It will complete the current sentence and then terminate.
    endRequested = true;
    endBtn.disabled = true;
    statusText.textContent = "Termination requested. Completing current sentence...";
    addMessage("system", "Interviewer will finish the current sentence, then complete the interview.");
    return;
  }

  sendBtn.disabled = true;
  micBtn.disabled = true;
  repeatBtn.disabled = true;
  answerInput.disabled = true;
  endBtn.disabled = true;
  statusText.textContent = "Ending interview and preparing feedback...";

  try {
    await finishInterview();
  } catch (error) {
    statusText.textContent = "Interview ended.";
  }
});

resetBtn.addEventListener("click", () => {
  if (isListening) {
    const shouldResetNow = window.confirm(
      "You are still answering. Do you want to stop the current answer and reset the interview?"
    );

    if (!shouldResetNow) {
      return;
    }
  }

  if (isInterviewerSpeaking) {
    const shouldResetDuringSpeech = window.confirm(
      "The interviewer is still speaking. Do you want to stop that and reset the interview?"
    );

    if (!shouldResetDuringSpeech) {
      return;
    }

    cancelInterviewerSpeech();
  }

  stopTimer();
  updateProgress(0);
  stopListening(true);
  stopSpeaking();
  clearResumeState();
  resetChat();
  endRequested = false;
  answerInput.value = "";
  answerInput.disabled = true;
  sendBtn.disabled = true;
  micBtn.disabled = true;
  repeatBtn.disabled = true;
  endBtn.disabled = true;
  statusText.textContent = "Upload a TXT, PDF, or DOCX resume and start the interview.";
  errorText.textContent = "";
  updateStartAvailability();
});

// ----------------------------------------------------
// Sentence-Level & Word Sync Playback Logic
// ----------------------------------------------------
function splitIntoSentences(text) {
  if (!text) return [];
  // Split on punctuation followed by whitespace or string boundaries
  const regex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+(?:\s+|$)/g;
  const matches = text.match(regex) || [text];
  return matches.map((s) => s.trim()).filter(Boolean);
}

async function presentInterviewerMessage(text) {
  const renderToken = ++currentRenderToken;
  const div = document.createElement("div");
  div.className = "message ai";
  div.textContent = "";
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  isInterviewerSpeaking = true;
  endRequested = false;

  const sentences = splitIntoSentences(text);
  let renderedText = "";

  try {
    for (let i = 0; i < sentences.length; i += 1) {
      if (renderToken !== currentRenderToken) return;
      if (endRequested) {
        break; // Stop sequential speaking immediately
      }

      const sentence = sentences[i];
      
      // Wait for the single sentence speech and visual sync to finish
      await playSentenceAndReveal(div, sentence, renderedText, renderToken);
      
      // Permanently append completed sentence to cumulative view
      renderedText += (renderedText ? " " : "") + sentence;
      div.textContent = renderedText;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } finally {
    if (currentRenderToken === renderToken) {
      isInterviewerSpeaking = false;
      setSoundWaveActive(false);

      if (endRequested) {
        endRequested = false;
        await finishInterview();
      }
    }
  }
}

async function playSentenceAndReveal(element, sentence, previousText, renderToken) {
  // Start sound waves
  setSoundWaveActive(true, "AI Interviewer is speaking...");

  const words = sentence.split(/\s+/).filter(Boolean);
  const playbackStarted = createDeferred();
  const playbackFinished = createDeferred();

  let audioBlob = null;
  let useFallback = false;

  try {
    audioBlob = await generateSpeechAudio(sentence);
  } catch (error) {
    console.warn("Gemini TTS failed, falling back to Web Speech synthesis: ", error);
    useFallback = true;
  }

  if (useFallback) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      const wordDelayMs = getWordRevealDelay(words.length);
      for (let i = 0; i < words.length; i += 1) {
        if (renderToken !== currentRenderToken) return;
        const visibleSentence = words.slice(0, i + 1).join(" ");
        element.textContent = previousText ? `${previousText} ${visibleSentence}` : visibleSentence;
        chatBox.scrollTop = chatBox.scrollHeight;
        await wait(wordDelayMs);
      }
      return;
    }

    // Browser Speech Synthesis Fallback Mode
    const utterance = new SpeechSynthesisUtterance(humanizeSpeechText(sentence));
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    // Load first available English browser voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0];
    if (match) {
      utterance.voice = match;
    }

    utterance.onstart = () => {
      playbackStarted.resolve();
    };

    // Word sync event hook
    utterance.onboundary = (event) => {
      if (renderToken !== currentRenderToken) return;
      if (event.name === "word") {
        const charIndex = event.charIndex;
        const spokenText = sentence.slice(0, charIndex).trim();
        const spokenWordsCount = spokenText ? spokenText.split(/\s+/).length : 0;
        
        const visibleSentence = words.slice(0, spokenWordsCount + 1).join(" ");
        element.textContent = previousText ? `${previousText} ${visibleSentence}` : visibleSentence;
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    };

    utterance.onend = () => {
      playbackFinished.resolve();
    };

    utterance.onerror = () => {
      playbackFinished.resolve();
    };

    window.speechSynthesis.speak(utterance);

    await Promise.race([playbackStarted.promise, wait(600)]);
    await Promise.race([playbackFinished.promise, wait(Math.max(2500, words.length * 450))]);
  } else {
    // Gemini Premium AI Voice Mode
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(audioUrl);
    const revealCompleted = createDeferred();

    currentAudio.onplay = () => {
      playbackStarted.resolve();
    };
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      playbackFinished.resolve();
    };
    currentAudio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      playbackFinished.resolve();
    };

    currentAudio.play().catch(() => {
      playbackFinished.resolve();
    });

    // Run timed progressive reveal concurrently
    const wordDelayMs = getWordRevealDelay(words.length);
    (async () => {
      await playbackStarted.promise;
      for (let i = 0; i < words.length; i += 1) {
        if (renderToken !== currentRenderToken) return;
        const visibleSentence = words.slice(0, i + 1).join(" ");
        element.textContent = previousText ? `${previousText} ${visibleSentence}` : visibleSentence;
        chatBox.scrollTop = chatBox.scrollHeight;
        await wait(wordDelayMs);
      }
      revealCompleted.resolve();
    })();

    await Promise.all([playbackFinished.promise, revealCompleted.promise]);
  }
}

// ----------------------------------------------------
// Submit Candidate Answer Logic
// ----------------------------------------------------
async function submitAnswer() {
  const userAnswer = answerInput.value.trim();

  if (!interviewStarted) {
    errorText.textContent = "Start the interview first.";
    return;
  }

  if (!userAnswer) {
    errorText.textContent = "Answer cannot be empty.";
    return;
  }

  errorText.textContent = "";
  
  // Finalize real-time speech bubble if it exists, otherwise create a new static one
  if (activeUserBubble) {
    activeUserBubble.textContent = userAnswer;
    activeUserBubble.classList.remove("active-speech");
    activeUserBubble = null;
  } else {
    addMessage("user", userAnswer);
  }
  
  conversationHistory.push({ role: "user", text: userAnswer });
  answerInput.value = "";

  sendBtn.disabled = true;
  micBtn.disabled = true;
  answerInput.disabled = true;
  statusText.textContent = "Interviewer is thinking...";

  try {
    if (interviewTurn >= getMaxQuestions()) {
      await finishInterview();
      return;
    }

    interviewTurn += 1;
    const reply = await generateInterviewerReply(false);
    updateProgress(interviewTurn);
    
    await presentInterviewerMessage(reply);
    conversationHistory.push({ role: "assistant", text: reply });
    lastQuestionSpoken = reply;

    statusText.textContent = "Interview in progress.";
    answerInput.disabled = false;
    sendBtn.disabled = true; // Wait for typing or speaking
    micBtn.disabled = !isVoiceCaptureAvailable();
    repeatBtn.disabled = false;
  } catch (error) {
    errorText.textContent = error.message || "Could not get interviewer reply.";
    statusText.textContent = "Something went wrong.";
    answerInput.disabled = false;
    sendBtn.disabled = !answerInput.value.trim();
    micBtn.disabled = !isVoiceCaptureAvailable();
    repeatBtn.disabled = false;
  }
}

// ----------------------------------------------------
// Feedback Rendering & Export Logic
// ----------------------------------------------------
function showReportCard(feedbackJsonText) {
  let report = null;
  try {
    let cleanedText = feedbackJsonText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    report = JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse JSON feedback:", error, feedbackJsonText);
    report = parseFeedbackTextFallback(feedbackJsonText);
  }

  // Populate visual metrics
  document.getElementById("metricOverallScore").textContent = (report.overallScore || 80) + "%";
  document.getElementById("metricGrammarScore").textContent = (report.grammarScore || 80) + "%";
  document.getElementById("metricConfidenceScore").textContent = (report.confidenceScore || 80) + "%";
  document.getElementById("metricFillers").textContent = report.fillerWordCount !== undefined ? report.fillerWordCount : "--";

  // Populate text overview
  feedbackOverview.textContent = report.overview || "Overall performance was satisfactory.";

  // Populate strengths
  feedbackStrengths.innerHTML = "";
  const strengths = report.strengths || [];
  if (strengths.length > 0) {
    strengths.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      feedbackStrengths.appendChild(li);
    });
  } else {
    feedbackStrengths.innerHTML = "<li>Strong overall performance</li><li>Responds well under different modes</li><li>Good articulation of resume content</li>";
  }

  // Populate areas to improve
  feedbackWeaknesses.innerHTML = "";
  const improvements = report.improvements || [];
  if (improvements.length > 0) {
    improvements.forEach(w => {
      const li = document.createElement("li");
      li.textContent = w;
      feedbackWeaknesses.appendChild(li);
    });
  } else {
    feedbackWeaknesses.innerHTML = "<li>Structure responses with STAR technique</li><li>Highlight quantifiable business outcomes</li><li>Avoid long speech pauses</li>";
  }

  // Populate mistakes and corrections table
  const mistakesSection = document.getElementById("mistakesSection");
  const feedbackMistakes = document.getElementById("feedbackMistakes");
  feedbackMistakes.innerHTML = "";
  
  const mistakes = report.mistakes || [];
  if (mistakes.length > 0 && mistakesSection) {
    mistakesSection.style.display = "block";
    mistakes.forEach(m => {
      const tr = document.createElement("tr");
      
      const tdOriginal = document.createElement("td");
      tdOriginal.textContent = m.original || "";
      
      const tdCorrection = document.createElement("td");
      tdCorrection.textContent = m.correction || "";
      
      const tdExplanation = document.createElement("td");
      tdExplanation.textContent = m.explanation || "";
      
      tr.appendChild(tdOriginal);
      tr.appendChild(tdCorrection);
      tr.appendChild(tdExplanation);
      feedbackMistakes.appendChild(tr);
    });
  } else if (mistakesSection) {
    mistakesSection.style.display = "none";
  }

  // Populate focus topics
  feedbackTopics.innerHTML = "";
  const topics = report.focusTopics || report.topics || [];
  if (topics.length > 0) {
    topics.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      feedbackTopics.appendChild(li);
    });
  } else {
    feedbackTopics.innerHTML = "<li>Key system architectures in projects</li><li>Details of tools listed in skills</li><li>Common behavioral questions</li>";
  }

  reportCardModal.classList.add("active");
  addMessage("system", "Mock Interview evaluation completed. Click Close to return.");
}

function parseFeedbackTextFallback(feedbackText) {
  let overview = "";
  let strengths = [];
  let improvements = [];
  let topics = [];

  try {
    const overviewMatch = feedbackText.match(/OVERVIEW:([\s\S]*?)(STRENGTHS:|$)/i);
    const strengthsMatch = feedbackText.match(/STRENGTHS:([\s\S]*?)(IMPROVEMENTS:|$)/i);
    const improvementsMatch = feedbackText.match(/IMPROVEMENTS:([\s\S]*?)(TOPICS TO FOCUS ON:|$)/i);
    const topicsMatch = feedbackText.match(/TOPICS TO FOCUS ON:([\s\S]*?)$/i);

    if (overviewMatch) overview = overviewMatch[1].trim();
    if (strengthsMatch) {
      strengths = strengthsMatch[1].split("\n").map(s => s.replace(/^-\s*/, "").trim()).filter(Boolean);
    }
    if (improvementsMatch) {
      improvements = improvementsMatch[1].split("\n").map(s => s.replace(/^-\s*/, "").trim()).filter(Boolean);
    }
    if (topicsMatch) {
      topics = topicsMatch[1].split("\n").map(s => s.replace(/^-\s*/, "").trim()).filter(Boolean);
    }
  } catch (e) {
    console.error("Regex parsing fallback failed", e);
  }

  return {
    overallScore: 80,
    grammarScore: 80,
    confidenceScore: 80,
    fillerWordCount: 0,
    pacing: "Good",
    overview: overview || feedbackText,
    strengths,
    improvements,
    focusTopics: topics,
    mistakes: []
  };
}

closeReportBtn.addEventListener("click", () => {
  reportCardModal.classList.remove("active");
});

downloadTranscriptBtn.addEventListener("click", () => {
  let content = `==================================================\n`;
  content += `          MOCK INTERVIEW COACH REPORT CARD        \n`;
  content += `==================================================\n\n`;
  content += `Date: ${new Date().toLocaleString()}\n`;
  content += `Mode: ${interviewMode.toUpperCase()}\n\n`;

  content += `Overall Score: ${document.getElementById("metricOverallScore").textContent}\n`;
  content += `Grammar & Vocab: ${document.getElementById("metricGrammarScore").textContent}\n`;
  content += `Confidence Rate: ${document.getElementById("metricConfidenceScore").textContent}\n`;
  content += `Filler Words: ${document.getElementById("metricFillers").textContent}\n\n`;
  
  content += `--------------------------------------------------\n`;
  content += `1. COACH OVERVIEW\n`;
  content += `--------------------------------------------------\n`;
  content += `${feedbackOverview.textContent}\n\n`;
  
  content += `--------------------------------------------------\n`;
  content += `2. KEY STRENGTHS\n`;
  content += `--------------------------------------------------\n`;
  Array.from(feedbackStrengths.children).forEach(child => {
    content += `- ${child.textContent}\n`;
  });
  content += `\n`;

  content += `--------------------------------------------------\n`;
  content += `3. AREAS TO IMPROVE\n`;
  content += `--------------------------------------------------\n`;
  Array.from(feedbackWeaknesses.children).forEach(child => {
    content += `- ${child.textContent}\n`;
  });
  content += `\n`;

  const mistakesRows = Array.from(document.getElementById("feedbackMistakes").children);
  if (mistakesRows.length > 0) {
    content += `--------------------------------------------------\n`;
    content += `SPEECH & GRAMMAR ANALYSIS (MISTAKES & CORRECTIONS)\n`;
    content += `--------------------------------------------------\n`;
    mistakesRows.forEach(row => {
      const cols = row.children;
      if (cols.length >= 3) {
        content += `Phrase Used: "${cols[0].textContent}"\n`;
        content += `Correction:  "${cols[1].textContent}"\n`;
        content += `Explanation: ${cols[2].textContent}\n`;
        content += `--------------------------------------------------\n`;
      }
    });
    content += `\n`;
  }

  content += `--------------------------------------------------\n`;
  content += `4. TOPICS TO FOCUS ON\n`;
  content += `--------------------------------------------------\n`;
  Array.from(feedbackTopics.children).forEach(child => {
    content += `- ${child.textContent}\n`;
  });
  content += `\n`;

  content += `==================================================\n`;
  content += `               INTERVIEW TRANSCRIPT               \n`;
  content += `==================================================\n\n`;
  
  conversationHistory.forEach((msg) => {
    const roleName = msg.role === "user" ? "Candidate" : "Interviewer";
    content += `[${roleName}]:\n${msg.text}\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Interview_Report_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ----------------------------------------------------
// Core Interview Functions (Gemini Calls)
// ----------------------------------------------------
async function readResumeText(file) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".txt")) {
    return await file.text();
  }

  if (lowerName.endsWith(".pdf")) {
    return await extractPdfText(file);
  }

  if (lowerName.endsWith(".docx")) {
    return await extractDocxText(file);
  }

  throw new Error("Unsupported file type. Use TXT, PDF, or DOCX.");
}

async function startVoiceCapture() {
  const useWebSpeechForTranscription = !!LiveSpeechRecognitionClass;

  if (useWebSpeechForTranscription) {
    // Teardown previous speech recognition session to start cleanly
    isListening = false;
    stopLiveRecognition();

    setTimeout(() => {
      isListening = true;
      shouldSubmitAfterListening = true;
      liveTranscriptFinal = "";
      liveTranscriptInterim = "";
      liveTranscriptSnapshot = "";
      recordingStartedAt = Date.now();
      lastSpeechActivityAt = recordingStartedAt;
      micBtn.textContent = "Stop Speaking";
      micBtn.classList.add("listening");
      statusText.textContent = "Listening...";
      errorText.textContent = "";
      setHelperText("Live captions are on. Your words should appear here while you speak.");
      
      // Create visual user message bubble in the chat box in real-time
      activeUserBubble = document.createElement("div");
      activeUserBubble.className = "message user active-speech";
      activeUserBubble.textContent = "Listening...";
      chatBox.appendChild(activeUserBubble);
      chatBox.scrollTop = chatBox.scrollHeight;
      
      // Start microphone sound waves
      setSoundWaveActive(true, "Listening to your answer...");
      
      startLiveRecognition();
      startHesitationWatch();
    }, 200);
  } else {
    if (!canTranscribeRecordedAudio()) {
      statusText.textContent = "Live captions need browser speech support or Gemini.";
      errorText.textContent = "";
      setHelperText("For automatic live text, use Chrome/Edge microphone speech recognition, or add a Gemini API key for audio transcription.");
      resetVoiceControlsAfterFailure();
      return;
    }

    // Fallback to MediaRecorder + Gemini WAV transcription (for browsers without SpeechRecognition support)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      recordedMimeType = pickRecordingMimeType();
      mediaRecorder = recordedMimeType ? new MediaRecorder(stream, { mimeType: recordedMimeType }) : new MediaRecorder(stream);
      recordedMimeType = mediaRecorder.mimeType || recordedMimeType || "audio/webm";

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        isListening = true;
        shouldSubmitAfterListening = true;
        recordingStartedAt = Date.now();
        micBtn.textContent = "Stop Speaking";
        micBtn.classList.add("listening");
        statusText.textContent = "Listening...";
        errorText.textContent = "";
        setHelperText("Recording fallback is active. Transcript preview updates every few seconds.");

        activeUserBubble = document.createElement("div");
        activeUserBubble.className = "message user active-speech";
        activeUserBubble.textContent = "Listening...";
        chatBox.appendChild(activeUserBubble);
        chatBox.scrollTop = chatBox.scrollHeight;

        setSoundWaveActive(true, "Listening to your answer...");
        startHesitationWatch();
        
        // Start real-time Gemini-powered transcription interval
        startRealTimeGeminiTranscription();
      };

      mediaRecorder.onerror = () => {
        isListening = false;
        shouldSubmitAfterListening = false;
        micBtn.textContent = "Speak Answer";
        micBtn.classList.remove("listening");
        setSoundWaveActive(false);
        
        // Stop real-time interval
        stopRealTimeGeminiTranscription();

        if (activeUserBubble) {
          activeUserBubble.remove();
          activeUserBubble = null;
        }

        stopHesitationWatch();
        errorText.textContent = "Microphone recording failed. Try again.";
      };

      mediaRecorder.onstop = async () => {
        isListening = false;
        micBtn.textContent = "Speak Answer";
        micBtn.classList.remove("listening");
        setSoundWaveActive(false);
        stopHesitationWatch();
        
        // Stop real-time interval
        stopRealTimeGeminiTranscription();

        try {
          const audioBlob = new Blob(recordedChunks, { type: recordedMimeType || "audio/webm" });
          recordedChunks = [];
          stopStreamTracks(stream);

          if (!audioBlob.size) {
            if (activeUserBubble) {
              activeUserBubble.remove();
              activeUserBubble = null;
            }
            statusText.textContent = "No clear answer captured. Try speaking again.";
            return;
          }

          statusText.textContent = "Transcribing your answer...";
          const transcript = await transcribeAudioWithGemini(audioBlob);
          
          answerInput.value = transcript;
          if (activeUserBubble) {
            activeUserBubble.textContent = transcript;
            chatBox.scrollTop = chatBox.scrollHeight;
          }

          if (transcript.trim()) {
            if (interviewStarted && !isInterviewerSpeaking) {
              sendBtn.disabled = false;
            }

            if (shouldSubmitAfterListening) {
              statusText.textContent = "Answer captured. Sending it now...";
              setHelperText("Answer captured from your recording. Sending it now...");
              shouldSubmitAfterListening = false;
              await submitAnswer();
              return;
            }
          } else {
            if (activeUserBubble) {
              activeUserBubble.remove();
              activeUserBubble = null;
            }
            shouldSubmitAfterListening = false;
            statusText.textContent = "No clear answer captured. Try speaking again.";
            setHelperText("Speak clearly after clicking Speak Answer, or type your answer.");
          }
        } catch (error) {
          if (activeUserBubble) {
            activeUserBubble.remove();
            activeUserBubble = null;
          }
          shouldSubmitAfterListening = false;
          errorText.textContent = "";
          statusText.textContent = "Voice answer failed. Try again.";
          setHelperText(error.message || "Could not transcribe your answer. Type your answer or try again.");
          stopStreamTracks(stream);
        }
      };

      mediaRecorder.start(1000);
    } catch (error) {
      if (error && error.name === "NotAllowedError") {
        errorText.textContent = "Microphone permission is blocked. Allow mic access in your browser.";
        setHelperText("Automatic captions need microphone permission.");
      } else {
        errorText.textContent = "";
        setHelperText("Could not start microphone recording. Type your answer or try again.");
      }
    }
  }
}

async function transcribeAudioWithGemini(audioBlob) {
  if (!getApiKey()) {
    throw new Error("Recorded-audio transcription needs a Gemini API key. Type your answer instead.");
  }

  const audioBase64 = await blobToBase64(audioBlob);
  
  let cleanMimeType = audioBlob.type || "audio/webm";
  if (cleanMimeType.includes(";")) {
    cleanMimeType = cleanMimeType.split(";")[0].trim();
  }

  const prompt = `
Transcribe this interview answer exactly.

Rules:
- Return only the spoken answer as plain text.
- Do not add commentary.
- Clean up speech disfluencies (filler words like "um", "uh", "ah", "like", "you know") to make it sound professional and humanized.
- Fix only obvious transcription breaks.
- Keep the candidate's meaning intact.
- CRITICAL: If the audio is silent, contains only background static/noise, or has no clear spoken words, return exactly an empty string "" (nothing). Do not generate, assume, or hallucinate any interview answer.
`;

  const data = await callGeminiParts([
    { text: prompt },
    {
      inline_data: {
        mime_type: cleanMimeType,
        data: audioBase64
      }
    }
  ]);

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    // Return empty string on silent or unparseable clips instead of crashing
    return "";
  }

  return data.candidates[0].content.parts[0].text.trim();
}

async function extractPdfText(file) {
  const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str || "").join(" ");
    pages.push(text);
  }

  return pages.join("\n").trim();
}

async function extractDocxText(file) {
  if (!window.mammoth) {
    throw new Error("DOCX reader could not load. Refresh and try again.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return (result.value || "").trim();
}

async function generateInterviewerReply(isFirstQuestion) {
  if (!getApiKey()) {
    return generateLocalInterviewerReply(isFirstQuestion);
  }

  const modeInstruction = getModeInstruction(interviewMode);
  const historyText = conversationHistory
    .map((item) => `${item.role === "user" ? "Candidate" : "Interviewer"}: ${item.text}`)
    .join("\n");

  const jobConfigText = getJobConfigurationText();
  let resumeSection = "";
  if (resumeText.trim() || canSendResumeInline()) {
    resumeSection = resumeText.trim()
      ? `Resume:\n${resumeText}`
      : "Resume:\nThe resume file is attached with this request. Read it directly before asking questions.";
    if (jobConfigText) {
      resumeSection += `\n\nTarget Job Role Configuration:\n${jobConfigText}`;
    }
  } else if (jobConfigText) {
    resumeSection = `Target Job Role Configuration (No Resume Uploaded):\n${jobConfigText}`;
  } else {
    resumeSection = "Resume:\nNone uploaded. Ask general professional questions.";
  }

  const prompt = `
You are a real, warm human mock interviewer. 

Rules:
- Sound highly humanized, conversational, and natural.
- Use natural conversational transitions or short conversational receipts (e.g. "Ah, got it!", "That's really interesting.", "Okay, makes sense.", "Well, that's a common challenge...", "Great.") at the beginning of your replies.
- Ask questions based on the candidate's resume and/or target job role details.
- Ask exactly one question at a time.
- If the candidate struggles, encourage them warmly.
- If the answer is decent, acknowledge it briefly and ask a natural, conversational follow-up.
- Keep your reply short, conversational, and completely free of bullet lists or numbered formats.
- Every question must flow naturally from the candidate's previous answer or resume/job details.

Interview mode:
${modeInstruction}

${resumeSection}

Conversation so far:
${historyText || "No previous conversation yet."}

Task:
${isFirstQuestion
  ? "Start the mock interview with the best first question based on the resume/job details."
  : "Reply to the candidate's latest answer like a human interviewer, then ask the next question based on the resume/job details."}
`;

  let data;
  try {
    data = await callGemini(prompt);
  } catch (error) {
    console.warn("Gemini question generation failed. Using local fallback.", error);
    return generateLocalInterviewerReply(isFirstQuestion);
  }

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    throw new Error("Gemini returned an incomplete response.");
  }

  return data.candidates[0].content.parts[0].text.trim();
}

async function generateFeedback() {
  if (!getApiKey()) {
    return generateLocalFeedback();
  }

  const historyText = conversationHistory
    .map((item) => `${item.role === "user" ? "Candidate" : "Interviewer"}: ${item.text}`)
    .join("\n");

  const jobConfigText = getJobConfigurationText();
  let resumeSection = "";
  if (resumeText.trim() || canSendResumeInline()) {
    resumeSection = resumeText.trim()
      ? `Resume:\n${resumeText}`
      : "Resume:\nThe resume file is attached with this request. Read it directly before giving feedback.";
    if (jobConfigText) {
      resumeSection += `\n\nTarget Job Role Configuration:\n${jobConfigText}`;
    }
  } else if (jobConfigText) {
    resumeSection = `Target Job Role Configuration (No Resume): ${jobConfigText}`;
  }

  const prompt = `
You are an expert interview coach. Analyze the candidate's mock interview performance, speaking skills, confidence level, disfluencies, grammar mistakes, and overall alignment.

You MUST return a valid JSON object ONLY. Do not enclose it in markdown blocks or add extra commentary. Return the following exact JSON keys:
{
  "overallScore": 85,
  "grammarScore": 90,
  "confidenceScore": 80,
  "fillerWordCount": 4,
  "pacing": "Good / Too Fast / Too Slow",
  "overview": "A detailed 2-3 sentence overview of their overall performance.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "focusTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "mistakes": [
    {
      "original": "Phrase or sentence they used with a grammatical error or disfluency.",
      "correction": "The corrected version of that phrase.",
      "explanation": "Brief explanation of why it is incorrect and how this correction helps."
    }
  ]
}

${resumeSection}

Interview transcript:
${historyText}
`;

  let data;
  try {
    data = await callGemini(prompt, "application/json");
  } catch (error) {
    console.warn("Gemini feedback generation failed. Using local fallback.", error);
    return generateLocalFeedback();
  }

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    throw new Error("Gemini returned incomplete feedback.");
  }

  return data.candidates[0].content.parts[0].text.trim();
}

function generateLocalInterviewerReply(isFirstQuestion) {
  const profile = extractResumeProfile(resumeText);
  const topic = profile.topics[(interviewTurn - 1) % profile.topics.length] || "your recent work";
  const project = profile.projects[(interviewTurn - 1) % profile.projects.length] || topic;
  const pressurePrefix = interviewMode === "pressure"
    ? "Let's be specific here."
    : interviewMode === "realistic"
      ? "Thanks, let's go a level deeper."
      : "Great, let's explore that together.";

  if (isFirstQuestion) {
    return `Thanks for sharing your resume. Could you walk me through your background and connect it to your strongest experience with ${topic}?`;
  }

  const prompts = [
    `${pressurePrefix} What was the hardest technical decision you made while working on ${project}, and how did you validate that it was the right choice?`,
    `${pressurePrefix} Can you describe a measurable result or improvement from your work with ${topic}?`,
    `${pressurePrefix} Tell me about a challenge you faced in ${project}. What did you try first, what changed, and what did you learn?`,
    `${pressurePrefix} If you had to improve one part of your ${topic} experience today, what would you change and why?`,
    `${pressurePrefix} How would you explain your work on ${project} to a non-technical stakeholder?`
  ];

  return prompts[(interviewTurn - 2 + prompts.length) % prompts.length];
}

function generateLocalFeedback() {
  const userAnswers = conversationHistory
    .filter((item) => item.role === "user")
    .map((item) => item.text);
  const allAnswers = userAnswers.join(" ");
  const fillerMatches = allAnswers.match(/\b(um|uh|ah|like|basically|you know|i mean)\b/gi) || [];
  const averageWords = userAnswers.length
    ? Math.round(userAnswers.reduce((sum, answer) => sum + answer.split(/\s+/).filter(Boolean).length, 0) / userAnswers.length)
    : 0;
  const profile = extractResumeProfile(resumeText);
  const confidenceScore = averageWords >= 35 ? 82 : averageWords >= 18 ? 74 : 65;
  const grammarScore = Math.max(68, 92 - fillerMatches.length * 3);
  const overallScore = Math.round((confidenceScore + grammarScore + 78) / 3);

  return JSON.stringify({
    overallScore,
    grammarScore,
    confidenceScore,
    fillerWordCount: fillerMatches.length,
    pacing: averageWords >= 45 ? "Good" : "Could use more detail",
    overview: "This offline report is based on answer length, resume-topic coverage, and common speech patterns. Add a Gemini API key for deeper semantic feedback, but this gives you a practical baseline for rehearsal.",
    strengths: [
      userAnswers.length ? "Completed the practice flow with resume-focused answers." : "Started a resume-focused practice session.",
      `Discussed topics related to ${profile.topics.slice(0, 2).join(" and ")}.`,
      "Used the mock interview format to practice structured recall."
    ],
    improvements: [
      "Use the STAR structure: situation, task, action, result.",
      "Add numbers, scale, latency, revenue, users, or time saved where possible.",
      "Close each answer with what you learned or how you would improve it."
    ],
    focusTopics: profile.topics.slice(0, 3),
    mistakes: fillerMatches.length
      ? [{
          original: "Repeated filler words such as " + Array.from(new Set(fillerMatches.map((word) => word.toLowerCase()))).join(", "),
          correction: "Pause briefly instead of filling silence.",
          explanation: "Intentional pauses sound more confident and give you time to organize the next sentence."
        }]
      : []
  });
}

function extractResumeProfile(text) {
  const fallbackTopics = ["your technical projects", "your core skills", "your recent experience"];
  const words = String(text || "")
    .replace(/[^a-zA-Z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);
  const stopWords = new Set([
    "and", "the", "with", "for", "from", "that", "this", "you", "your", "are", "was",
    "were", "built", "using", "experience", "skills", "resume", "candidate", "engineer"
  ]);
  const counts = new Map();

  for (const word of words) {
    const normalized = word.toLowerCase();
    if (stopWords.has(normalized)) {
      continue;
    }
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  const topics = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 12);

  return {
    topics: topics.length ? topics : fallbackTopics,
    projects: lines.length ? lines.slice(0, 5) : fallbackTopics
  };
}

async function callGemini(prompt, responseMimeType = null) {
  return callGeminiParts(buildGeminiParts(prompt), responseMimeType);
}

async function callGeminiParts(parts, responseMimeType = null) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  let lastErrorMessage = "Gemini request failed. Check your API key and internet.";

  for (const model of GEMINI_MODELS) {
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);

    const bodyObj = {
      contents: [
        {
          parts
        }
      ]
    };

    if (responseMimeType) {
      bodyObj.generationConfig = {
        responseMimeType: responseMimeType
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyObj)
    });

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("Could not read Gemini response. Check your internet and API key.");
    }

    if (response.ok) {
      return data;
    }

    lastErrorMessage = readApiError(data);
  }

  throw new Error(lastErrorMessage);
}

async function finishInterview() {
  interviewStarted = false;
  stopListening(true);
  stopTimer();
  progressBar.style.width = "100%";
  turnCounter.textContent = "Completed";

  answerInput.disabled = true;
  sendBtn.disabled = true;
  micBtn.disabled = true;
  repeatBtn.disabled = true;
  endBtn.disabled = true;
  startBtn.disabled = false;
  statusText.textContent = "Interview completed. Preparing feedback...";

  addMessage("system", "Mock interview finished. Generating feedback...");

  try {
    const feedback = await generateFeedback();
    showReportCard(feedback);
    statusText.textContent = "Interview completed with feedback.";
  } catch (error) {
    addMessage("system", "Interview completed. Feedback could not be generated.");
    errorText.textContent = error.message || "";
    statusText.textContent = "Interview completed.";
  }
}

function getModeInstruction(mode) {
  if (mode === "friendly") {
    return "Friendly mode: supportive, calm, confidence-building, and gentle.";
  }

  if (mode === "pressure") {
    return "Pressure mode: more challenging, more direct, but still professional.";
  }

  return "Realistic mode: balanced, professional, and similar to a normal interviewer.";
}

function readApiError(data) {
  if (data && data.error && data.error.message) {
    const msg = data.error.message;
    const lower = msg.toLowerCase();
    if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("limit exceeded") || lower.includes("429")) {
      return "Gemini API rate limit exceeded. Google Free Tier allows 15 requests/min. Please wait a few seconds before trying again, or disable 'Real-time voice rendering' in the Voice & Sound settings to save API quota.";
    }
    return msg;
  }

  return "Gemini request failed. Check your API key and internet.";
}

function isRetryableModelError(message) {
  const text = String(message || "").toLowerCase();
  return text.includes("high demand") || 
         text.includes("overloaded") || 
         text.includes("unavailable") || 
         text.includes("try again later") || 
         text.includes("quota") || 
         text.includes("rate limit") || 
         text.includes("limit exceeded") || 
         text.includes("429");
}

function addMessage(type, text) {
  const div = document.createElement("div");
  div.className = "message " + type;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ----------------------------------------------------
// Recording & Helper Functions
// ----------------------------------------------------
function getWordRevealDelay(wordCount) {
  if (wordCount <= 8) {
    return 140;
  }

  if (wordCount <= 20) {
    return 125;
  }

  return 110;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createDeferred() {
  let resolve;

  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

function resetChat() {
  chatBox.innerHTML = `
    <div class="message system">
      Your mock interview will start here after you upload a resume and click Start Interview.
    </div>
  `;
}

function clearResumeState(resetPicker = true) {
  resumeText = "";
  selectedResumeFile = null;
  resumeMimeType = "";
  resumeFileBase64 = "";
  interviewStarted = false;
  interviewTurn = 0;
  conversationHistory = [];
  lastQuestionSpoken = "";

  if (jobTitleInput) jobTitleInput.value = "";
  if (jobDescInput) jobDescInput.value = "";
  if (experienceSelect) experienceSelect.value = "";
  stopWebcam();

  if (resetPicker) {
    resumeFile.value = "";
  }

  syncFileSelectionUI();

  startBtn.disabled = true;
  sendBtn.disabled = true;
  micBtn.disabled = true;
  repeatBtn.disabled = true;
  endBtn.disabled = true;
}

function updateStartAvailability() {
  if (!hasResumeReady()) {
    startBtn.disabled = true;
    micBtn.disabled = true;
    syncVoiceButtonLabel();
    repeatBtn.disabled = true;
    statusText.textContent = "Upload a resume or enter a Target Job Role to start the interview.";
    return;
  }

  startBtn.disabled = false;
  micBtn.disabled = !interviewStarted || !isVoiceCaptureAvailable();
  syncVoiceButtonLabel();
  repeatBtn.disabled = !lastQuestionSpoken.trim();

  const hasJob = getJobConfigurationText().trim();
  const hasRes = resumeText.trim() || canSendResumeInline();

  if (hasRes && hasJob) {
    statusText.textContent = "Resume and Job Role configured. Click Start Interview.";
  } else if (hasRes) {
    statusText.textContent = "Resume loaded. Click Start Interview.";
  } else {
    statusText.textContent = "Job Role configured. Click Start Interview.";
  }
}

function hasResumeReady() {
  return Boolean(resumeText.trim() || canSendResumeInline() || getJobConfigurationText().trim());
}

function getJobConfigurationText() {
  if (!jobTitleInput || !jobDescInput || !experienceSelect) return "";
  const title = jobTitleInput.value.trim();
  const desc = jobDescInput.value.trim();
  const exp = experienceSelect.value;
  
  let parts = [];
  if (title) parts.push(`Job Role: ${title}`);
  if (desc) parts.push(`Tech Stack/Skills: ${desc}`);
  if (exp) parts.push(`Experience Level: ${exp}`);
  
  return parts.join("\n");
}

function canSendResumeInline() {
  return Boolean(selectedResumeFile && resumeFileBase64 && isInlineSupportedResume());
}

function isInlineSupportedResume() {
  return resumeMimeType === "application/pdf";
}

function buildGeminiParts(prompt) {
  const parts = [{ text: prompt }];

  if (canSendResumeInline()) {
    parts.push({
      inline_data: {
        mime_type: resumeMimeType,
        data: resumeFileBase64
      }
    });
  }

  return parts;
}

async function fileToBase64(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");

      if (commaIndex === -1) {
        reject(new Error("Could not prepare the selected resume file."));
        return;
      }

      resolve(result.slice(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected resume file."));
    };

    reader.readAsDataURL(file);
  });
}

function guessMimeType(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lowerName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "text/plain";
}

function pickRecordingMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus"
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }

  return "";
}

async function blobToBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

async function convertAudioBlobToWav(audioBlob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("This browser cannot convert recorded audio for transcription.");
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const wavBytes = audioBufferToWav(audioBuffer);
    return new Blob([wavBytes], { type: "audio/wav" });
  } catch (error) {
    throw new Error("Could not prepare your recorded answer for transcription.");
  } finally {
    await audioContext.close();
  }
}

function audioBufferToWav(audioBuffer) {
  const channelData = mergeChannels(audioBuffer);
  const pcmBytes = float32To16BitPCM(channelData);
  return encodePcmToWav(pcmBytes, audioBuffer.sampleRate, 1, 16);
}

function mergeChannels(audioBuffer) {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const length = audioBuffer.length;
  const merged = new Float32Array(length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);

    for (let i = 0; i < length; i += 1) {
      merged[i] += data[i] / audioBuffer.numberOfChannels;
    }
  }

  return merged;
}

function float32To16BitPCM(floatData) {
  const pcm = new Uint8Array(floatData.length * 2);
  const view = new DataView(pcm.buffer);

  for (let i = 0; i < floatData.length; i += 1) {
    let sample = Math.max(-1, Math.min(1, floatData[i]));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, sample, true);
  }

  return pcm;
}

function pcmBase64ToWavBlob(base64Audio) {
  const pcmBytes = base64ToUint8Array(base64Audio);
  const wavBytes = encodePcmToWav(pcmBytes, 24000, 1, 16);
  return new Blob([wavBytes], { type: "audio/wav" });
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function encodePcmToWav(pcmBytes, sampleRate, channels, bitsPerSample) {
  const headerSize = 44;
  const wavBuffer = new ArrayBuffer(headerSize + pcmBytes.length);
  const view = new DataView(wavBuffer);
  const wavBytes = new Uint8Array(wavBuffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true);
  view.setUint16(32, channels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, pcmBytes.length, true);
  wavBytes.set(pcmBytes, headerSize);

  return wavBytes;
}

function writeAscii(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function stopStreamTracks(stream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function stopSpeaking(resetRender = true) {
  if (resetRender) {
    currentRenderToken += 1;
  }

  isInterviewerSpeaking = false;
  setSoundWaveActive(false);

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

async function generateSpeechAudio(text) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const voiceName = "Kore"; // Lock to Gemini Premium Kore (Balanced, professional female mock interviewer)

  const spokenText = humanizeSpeechText(text);
  const prompt = `
You are a warm, professional human interviewer. Read the text below exactly as a real person would in a warm, engaged, one-on-one conversation.

Guidelines:
- Pause naturally for breathing where you see "...".
- Keep a calm, warm, and highly conversational cadence.
- Do not sound like a robotic reader. Avoid flat or robotic patterns.
- Speak with natural pitch variations, friendly inflections, and clear expression.

Text to speak:
${spokenText}
`;

  let lastErrorMessage = "Gemini TTS request failed.";

  // Failover models pool for premium speech generation
  for (const model of GEMINI_MODELS) {
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        const base64Audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return pcmBase64ToWavBlob(base64Audio);
        }
      } else {
        lastErrorMessage = readApiError(data);
      }
    } catch (e) {
      lastErrorMessage = e.message || e;
    }
  }

  throw new Error(lastErrorMessage);
}

function humanizeSpeechText(text) {
  let cleaned = String(text || "")
    .replace(/\bAI\b/g, "A I")
    .replace(/\bML\b/g, "M L")
    .replace(/\bNLP\b/g, "N L P")
    .replace(/\bCNN\b/g, "C N N")
    .replace(/\bLSTM\b/g, "L S T M")
    .replace(/\bSQL\b/g, "S Q L")
    .replace(/\bAPI\b/g, "A P I")
    .replace(/\bUI\b/g, "U I")
    .replace(/\bUX\b/g, "U X")
    .replace(/\s+/g, " ")
    .replace(/[:;]\s*/g, "... ")
    .replace(/\?{2,}/g, "?")
    .replace(/!{2,}/g, "!")
    .replace(/\.\s*\./g, ".")
    .trim();

  // Convert punctuation marks to clean pause indicators for TTS synthesis
  cleaned = cleaned.replace(/,\s*/g, "... ");
  cleaned = cleaned.replace(/\.\s*/g, "... ");
  cleaned = cleaned.replace(/\?\s*/g, "?... ");
  cleaned = cleaned.replace(/!\s*/g, "!... ");
  
  // Collapse duplicate pauses
  cleaned = cleaned.replace(/\.{3,}/g, "... ");
  
  return cleaned.trim();
}

function startHesitationWatch() {
  stopHesitationWatch();

  hesitationWatchTimer = window.setInterval(() => {
    if (!isListening || currentAudio) {
      return;
    }

    const now = Date.now();
    const totalListeningTime = now - recordingStartedAt;
    const silenceTime = now - lastSpeechActivityAt;
    const hasSpokenAnything = Boolean((liveTranscriptFinal + liveTranscriptInterim).trim());

    if (!hasSpokenAnything && totalListeningTime >= 6500 && silenceTime >= 4500) {
      statusText.textContent = "Take your time.";
      stopHesitationWatch();
    }
  }, 700);
}

function stopHesitationWatch() {
  if (hesitationWatchTimer) {
    clearInterval(hesitationWatchTimer);
    hesitationWatchTimer = null;
  }
}

function stopListening(cancelAutoSubmit = false) {
  if (cancelAutoSubmit) {
    shouldSubmitAfterListening = false;
  }
  
  isListening = false;
  
  if (LiveSpeechRecognitionClass) {
    stopLiveRecognition();
  }
  
  if (mediaRecorder) {
    try {
      mediaRecorder.stop();
    } catch (error) {
      // already stopped or inactive
    }
  }
}

function cancelInterviewerSpeech() {
  stopSpeaking();
}

function cleanFillerWordsLocal(text) {
  if (!text) return "";
  return text
    .replace(/\b(um|uh|ah|like|basically|you\sknow|i\smean)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function startLiveRecognition() {
  if (!liveRecognition || isRecognitionActive) {
    return;
  }

  try {
    liveRecognition.start();
  } catch (error) {
    console.error("Failed to start speech recognition:", error);
    errorText.textContent = `Speech Recognition failed to start: ${error.message || error}`;
  }
}

function stopLiveRecognition() {
  if (!liveRecognition) {
    return;
  }

  try {
    liveRecognition.stop();
  } catch (error) {
    console.error("Failed to stop speech recognition:", error);
  }
}

function canTranscribeRecordedAudio() {
  return Boolean(getApiKey() && MEDIA_RECORDER_SUPPORTED);
}

function isVoiceCaptureAvailable() {
  return Boolean(LiveSpeechRecognitionClass || canTranscribeRecordedAudio());
}

function resetVoiceControlsAfterFailure() {
  isListening = false;
  shouldSubmitAfterListening = false;
  micBtn.textContent = "Speak Answer";
  micBtn.classList.remove("listening");
  setSoundWaveActive(false);
  stopHesitationWatch();

  if (interviewStarted && !isInterviewerSpeaking) {
    answerInput.disabled = false;
    sendBtn.disabled = !answerInput.value.trim();
    micBtn.disabled = !isVoiceCaptureAvailable();
  }
}

async function startMediaRecorderFallback() {
  if (!canTranscribeRecordedAudio()) {
    statusText.textContent = "Live captions need browser speech support or Gemini.";
    errorText.textContent = "";
    setHelperText("For automatic live text, use Chrome/Edge microphone speech recognition, or add a Gemini API key for audio transcription.");
    resetVoiceControlsAfterFailure();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    recordedMimeType = pickRecordingMimeType();
    mediaRecorder = recordedMimeType ? new MediaRecorder(stream, { mimeType: recordedMimeType }) : new MediaRecorder(stream);
    recordedMimeType = mediaRecorder.mimeType || recordedMimeType || "audio/webm";

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstart = () => {
      isListening = true;
      shouldSubmitAfterListening = true;
      recordingStartedAt = Date.now();
      micBtn.textContent = "Stop Speaking";
      micBtn.classList.add("listening");
      statusText.textContent = "Listening (Standard)...";
      errorText.textContent = "";
      setHelperText("Recording fallback is active. Transcript preview updates every few seconds.");

      activeUserBubble = document.createElement("div");
      activeUserBubble.className = "message user active-speech";
      activeUserBubble.textContent = "Recording answer...";
      chatBox.appendChild(activeUserBubble);
      chatBox.scrollTop = chatBox.scrollHeight;

      setSoundWaveActive(true, "Recording your answer...");
      startHesitationWatch();
      
      // Start real-time Gemini-powered transcription interval
      startRealTimeGeminiTranscription();
    };

    mediaRecorder.onerror = () => {
      isListening = false;
      shouldSubmitAfterListening = false;
      micBtn.textContent = "Speak Answer";
      micBtn.classList.remove("listening");
      setSoundWaveActive(false);
      
      // Stop real-time interval
      stopRealTimeGeminiTranscription();

      if (activeUserBubble) {
        activeUserBubble.remove();
        activeUserBubble = null;
      }

      stopHesitationWatch();
      errorText.textContent = "Microphone recording failed. Try again.";
    };

    mediaRecorder.onstop = async () => {
      isListening = false;
      micBtn.textContent = "Speak Answer";
      micBtn.classList.remove("listening");
      setSoundWaveActive(false);
      stopHesitationWatch();
      
      // Stop real-time interval
      stopRealTimeGeminiTranscription();

      try {
        const audioBlob = new Blob(recordedChunks, { type: recordedMimeType || "audio/webm" });
        recordedChunks = [];
        stopStreamTracks(stream);

        if (!audioBlob.size) {
          if (activeUserBubble) {
            activeUserBubble.remove();
            activeUserBubble = null;
          }
          statusText.textContent = "No clear answer captured. Try speaking again.";
          return;
        }

        statusText.textContent = "Transcribing your answer...";
        const transcript = await transcribeAudioWithGemini(audioBlob);
        
        answerInput.value = transcript;
        if (activeUserBubble) {
          activeUserBubble.textContent = transcript;
          chatBox.scrollTop = chatBox.scrollHeight;
        }

        if (transcript.trim()) {
          if (interviewStarted && !isInterviewerSpeaking) {
            sendBtn.disabled = false;
          }

        if (shouldSubmitAfterListening) {
          statusText.textContent = "Answer captured. Sending it now...";
          setHelperText("Answer captured from your recording. Sending it now...");
          shouldSubmitAfterListening = false;
          await submitAnswer();
          return;
          }
        } else {
          if (activeUserBubble) {
            activeUserBubble.remove();
            activeUserBubble = null;
          }
          shouldSubmitAfterListening = false;
          statusText.textContent = "No clear answer captured. Try speaking again.";
          setHelperText("Speak clearly after clicking Speak Answer, or type your answer.");
        }
      } catch (error) {
        if (activeUserBubble) {
          activeUserBubble.remove();
          activeUserBubble = null;
        }
        shouldSubmitAfterListening = false;
        errorText.textContent = "";
        statusText.textContent = "Voice answer failed. Try again.";
        setHelperText(error.message || "Could not transcribe your answer. Type your answer or try again.");
        stopStreamTracks(stream);
      }
    };

    mediaRecorder.start(1000);
  } catch (error) {
    if (error && error.name === "NotAllowedError") {
      errorText.textContent = "Microphone permission is blocked. Allow mic access in your browser.";
      setHelperText("Automatic captions need microphone permission.");
    } else {
      errorText.textContent = "";
      setHelperText("Could not start microphone recording. Type your answer or try again.");
    }
  }
}

function startRealTimeGeminiTranscription() {
  if (realTimeInterval) clearInterval(realTimeInterval);
  isIntervalTranscribing = false;

  // If real-time sync is disabled, do not run the background transcription interval to save API quota!
  if (realTimeSyncToggle && !realTimeSyncToggle.checked) {
    return;
  }

  realTimeInterval = setInterval(async () => {
    if (isIntervalTranscribing || !isListening || recordedChunks.length === 0) {
      return;
    }

    isIntervalTranscribing = true;
    try {
      // Create copy of current recorded chunks
      const audioBlob = new Blob(recordedChunks, { type: recordedMimeType || "audio/webm" });
      if (audioBlob.size > 1000) { // only transcribe if there's enough audio data
        // Send raw audio data directly to Gemini, bypassing AudioContext conversion to avoid decoding errors on incomplete files
        const transcript = await transcribeAudioWithGemini(audioBlob);
        
        if (transcript.trim() && isListening) {
          answerInput.value = transcript;
          if (activeUserBubble) {
            activeUserBubble.textContent = transcript;
            chatBox.scrollTop = chatBox.scrollHeight;
          }
        }
      }
    } catch (error) {
      console.warn("Real-time Gemini transcription error:", error);
      const errMsg = String(error.message || error).toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exceeded") || errMsg.includes("429")) {
        // Stop interval to prevent hammering the API key
        stopRealTimeGeminiTranscription();
        errorText.textContent = "";
        setHelperText("Gemini rate limit reached. Real-time preview paused, but recording continues until you click Stop Speaking.");
      } else {
        errorText.textContent = "";
        setHelperText(`Live sync paused: ${error.message || error}`);
      }
    } finally {
      isIntervalTranscribing = false;
    }
  }, 5500); // Set to 5.5 seconds to respect standard Gemini Free Tier rate limits (15 RPM)
}

function stopRealTimeGeminiTranscription() {
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
    realTimeInterval = null;
  }
}

updateStartAvailability();

if (window.location.protocol === "file:") {
  statusText.textContent = "For voice practice, open this app on a local server like http://localhost.";
}
