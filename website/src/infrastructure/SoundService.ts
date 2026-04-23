export class SoundService {
  private static enabled = true;
  private static ctx: AudioContext | null = null;
  private static initialized = false;
  private static selectedVoice: SpeechSynthesisVoice | null = null;
  private static voicesLoaded = false;

  private static readonly numberWords: Record<number, string> = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    30: "thirty",
    40: "forty",
    50: "fifty",
    60: "sixty",
    70: "seventy",
    80: "eighty",
    90: "ninety",
  };

  /**
   * MUST be called from a user gesture (click/tap) to unlock
   * both AudioContext and SpeechSynthesis on modern browsers.
   */
  public static initFromUserGesture() {
    if (this.initialized) return;
    this.initialized = true;

    // Unlock AudioContext
    this.getContext();

    // Prime speech synthesis with a silent utterance
    if ("speechSynthesis" in window) {
      const primer = new SpeechSynthesisUtterance("");
      primer.volume = 0;
      window.speechSynthesis.speak(primer);

      // Load voices
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private static loadVoices() {
    if (this.voicesLoaded) return;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    this.voicesLoaded = true;

    // Priority: en-IN > en-US > en-GB > any English
    const priorities = ["en-IN", "en-US", "en-GB"];
    for (const lang of priorities) {
      const match = voices.find(
        (v) => v.lang === lang || v.lang.startsWith(lang)
      );
      if (match) {
        this.selectedVoice = match;
        console.log(`[TTS] Using voice: ${match.name} (${match.lang})`);
        return;
      }
    }

    // Fallback: any English voice
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en")
    );
    if (englishVoice) {
      this.selectedVoice = englishVoice;
      console.log(`[TTS] Fallback voice: ${englishVoice.name} (${englishVoice.lang})`);
    } else {
      // Use the default voice
      this.selectedVoice = voices[0] || null;
      console.log(`[TTS] Default voice: ${this.selectedVoice?.name}`);
    }
  }

  public static toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled && this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.enabled;
  }

  public static isSoundEnabled() {
    return this.enabled;
  }

  private static getContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private static playFrequency(
    freq: number,
    type: OscillatorType,
    durationMs: number
  ) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.00001,
        ctx.currentTime + durationMs / 1000
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  }

  public static playCallSound(number?: number) {
    // Ensure initialization on first sound play
    if (!this.initialized) {
      this.initFromUserGesture();
    }

    this.playFrequency(600, "sine", 300);
    if (typeof number === "number") {
      // Wait for the beep to finish before speaking
      window.setTimeout(() => this.speakNumber(number), 350);
    }
  }

  public static playMarkSound() {
    this.playFrequency(400, "triangle", 150);
  }

  public static playWinSound() {
    setTimeout(() => this.playFrequency(440, "sine", 200), 0);
    setTimeout(() => this.playFrequency(554, "sine", 200), 200);
    setTimeout(() => this.playFrequency(659, "sine", 400), 400);
  }

  public static speakNumber(number: number) {
    if (!this.enabled) return;
    if (!("speechSynthesis" in window)) {
      console.warn("[TTS] speechSynthesis not available in this browser");
      return;
    }

    // Ensure voices are loaded
    if (!this.voicesLoaded) {
      this.loadVoices();
    }

    const phrase = this.getNumberCallPhrase(number);
    console.log(`[TTS] Speaking: "${phrase}"`);

    // Cancel any pending speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(phrase);

    // Assign voice if available
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Chrome workaround: speechSynthesis can get stuck if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    utterance.onerror = (event) => {
      console.warn("[TTS] Speech error:", event.error);
    };

    window.speechSynthesis.speak(utterance);
  }

  private static getNumberCallPhrase(number: number): string {
    const digitCall = String(number)
      .split("")
      .map((digit) => this.numberWords[Number(digit)])
      .join(" ");

    const numberCall = this.getNumberWords(number);
    return digitCall === numberCall
      ? `Number ${numberCall}`
      : `${digitCall}, ${numberCall}`;
  }

  private static getNumberWords(number: number): string {
    if (this.numberWords[number]) return this.numberWords[number];

    const tens = Math.floor(number / 10) * 10;
    const ones = number % 10;
    return `${this.numberWords[tens]} ${this.numberWords[ones]}`;
  }
}
