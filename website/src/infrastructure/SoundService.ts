export class SoundService {
  private static enabled = true;
  private static ctx: AudioContext | null = null;
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

  public static toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.enabled;
  }

  public static isSoundEnabled() {
    return this.enabled;
  }

  private static getContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private static playFrequency(freq: number, type: OscillatorType, durationMs: number) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + durationMs / 1000);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  }

  public static playCallSound(number?: number) {
    this.playFrequency(600, "sine", 300);
    if (typeof number === "number") {
      window.setTimeout(() => this.speakNumber(number), 180);
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

  private static speakNumber(number: number) {
    if (!this.enabled || !("speechSynthesis" in window)) return;

    const phrase = this.getNumberCallPhrase(number);
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "en-IN";
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  private static getNumberCallPhrase(number: number): string {
    const digitCall = String(number)
      .split("")
      .map((digit) => this.numberWords[Number(digit)])
      .join(" ");

    const numberCall = this.getNumberWords(number);
    return digitCall === numberCall ? numberCall : `${digitCall} ${numberCall}`;
  }

  private static getNumberWords(number: number): string {
    if (this.numberWords[number]) return this.numberWords[number];

    const tens = Math.floor(number / 10) * 10;
    const ones = number % 10;
    return `${this.numberWords[tens]} ${this.numberWords[ones]}`;
  }
}
