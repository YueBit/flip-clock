"""Generate flip-clock tick/tock sets.

A real flip clock makes two sounds per change: the flap releasing at the top
(a small, bright click) and the flap landing on the stop about 30ms later (a
harder clack with a little low body from the case). Each set here models that
differently; the point is to have candidates to audition, not one guess.

Pure stdlib so it runs anywhere.
"""
import math, os, random, struct, wave

SR = 44100


def lowpass6k(signal):
    """One-pole lowpass: takes the fizz off the noise without dulling the click."""
    a = 1 - math.exp(-2 * math.pi * 6000 / SR)
    y = 0.0
    out = []
    for x in signal:
        y += a * (x - y)
        out.append(y)
    return out


def biquad_bandpass(signal, lo, hi, passes=2):
    """RBJ constant-skirt bandpass, applied sample by sample."""
    f0 = math.sqrt(lo * hi)
    q = max(0.4, f0 / max(1.0, (hi - lo)))
    w0 = 2 * math.pi * f0 / SR
    alpha = math.sin(w0) / (2 * q)
    b0, b1, b2 = alpha, 0.0, -alpha
    a0, a1, a2 = 1 + alpha, -2 * math.cos(w0), 1 - alpha
    b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0
    x1 = x2 = y1 = y2 = 0.0
    out = []
    for x in signal:
        y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1 = x1, x
        y2, y1 = y1, y
        out.append(y)
    # a single pole leaves -6dB/octave skirts, which is exactly the hiss that
    # made the first attempt sound electronic; two passes gets the click tight
    for _ in range(passes - 1):
        x1 = x2 = y1 = y2 = 0.0
        res = []
        for x in out:
            y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
            x2, x1 = x1, x
            y2, y1 = y1, y
            res.append(y)
        out = res
    return lowpass6k(out)


def burst(t0, dur, lo, hi, amp, tau, seed):
    """Band-limited noise with an exponential decay: the impact itself."""
    rnd = random.Random(seed)
    n = int(dur * SR)
    raw = [rnd.uniform(-1, 1) for _ in range(n)]
    shaped = biquad_bandpass(raw, lo, hi)
    # filter gain varies wildly with the band, so normalise before applying the
    # intended level - otherwise a narrow band makes its impact inaudible
    m = max(abs(v) for v in shaped) or 1.0
    shaped = [v / m for v in shaped]
    out = [0.0] * int(t0 * SR) + [0.0] * n
    start = int(t0 * SR)
    for i, v in enumerate(shaped):
        out[start + i] = v * amp * math.exp(-(i / SR) / tau) * min(1.0, i / (0.0003 * SR))
    return out


def ring(t0, freq, dur, amp, tau):
    """A resonant part taking the hit (plastic shell, metal stop)."""
    out = [0.0] * int((t0 + dur) * SR)
    start = int(t0 * SR)
    for i in range(int(dur * SR)):
        t = i / SR
        out[start + i] = amp * math.sin(2 * math.pi * freq * t) * math.exp(-t / tau)
    return out


def thump(t0, freq, dur, amp, tau):
    out = [0.0] * int((t0 + dur) * SR)
    start = int(t0 * SR)
    for i in range(int(dur * SR)):
        t = i / SR
        out[start + i] = amp * math.sin(2 * math.pi * freq * t) * math.exp(-t / tau)
    return out


def mix(*parts):
    n = max(len(p) for p in parts)
    out = [0.0] * n
    for p in parts:
        for i, v in enumerate(p):
            out[i] += v
    return out


def finish(sig, peak=0.92, fade_in=0.0004, cut=0.075):
    """Soft-clip, normalise, cut at `cut` seconds with a short fade.

    A flip clock clack is over in well under a tenth of a second; anything that
    rings on into a boom makes it read as a synth hit, not a mechanism.
    """
    sig = [math.tanh(v * 1.15) for v in sig][: int(cut * SR)]
    m = max(abs(v) for v in sig) or 1.0
    sig = [v / m * peak for v in sig]
    fi = int(fade_in * SR)
    for i in range(min(fi, len(sig))):
        sig[i] *= i / fi
    fo = int(0.008 * SR)
    for i in range(fo):
        sig[len(sig) - 1 - i] *= i / fo
    return sig


def write(path, sig):
    w = wave.open(path, 'wb')
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767)) for v in sig))
    w.close()


# (name, release?, landing band, landing ring, low thump, decay character)
SETS = {
    # cardboard flap in a plastic case: small release click, then the clack
    'flap': dict(release=(1800, 3400, 0.30, 0.0025), band=(500, 2400), ring=(1150, 0.011, 0.55),
                 thump=(200, 0.018, 0.18), gap=0.026, seed=3),
    # heavier wooden case: darker, a touch more body
    'wood': dict(release=(1200, 2400, 0.18, 0.003), band=(380, 1600), ring=(820, 0.015, 0.62),
                 thump=(150, 0.020, 0.22), gap=0.024, seed=7),
    # sharp machined mechanism: short, dry, a bit of metal
    'sharp': dict(release=(2200, 4200, 0.26, 0.0018), band=(1100, 4200), ring=(2300, 0.008, 0.35),
                  thump=(340, 0.012, 0.12), gap=0.016, seed=11),
    # soft card in a wooden box: quiet, low, gentle
    'soft': dict(release=(800, 1800, 0.14, 0.004), band=(300, 1200), ring=(600, 0.018, 0.55),
                 thump=(120, 0.022, 0.24), gap=0.030, seed=19),
}

os.makedirs('sounds', exist_ok=True)
for name, p in SETS.items():
    for kind, detune in (('tick', 1.0), ('tock', 0.82)):
        r_lo, r_hi, r_amp, r_tau = p['release']
        lo, hi = p['band']
        f_ring, ring_tau, ring_amp = p['ring']
        f_thump, thump_tau, thump_amp = p['thump']
        sig = mix(
            burst(0.0, 0.012, r_lo * detune, r_hi * detune, r_amp, r_tau, p['seed']),
            burst(p['gap'], 0.040, lo * detune, hi * detune, 1.0, 0.010, p['seed'] + 1),
            ring(p['gap'], f_ring * detune, 0.045, ring_amp, ring_tau),
            thump(p['gap'], f_thump * detune, 0.050, thump_amp, thump_tau),
        )
        sig = finish(sig)
        path = 'sounds/%s-%s.wav' % (name, kind)
        write(path, sig)
        print('%-14s %5.1f ms  peak %.2f' % (path, len(sig) / SR * 1000, max(abs(v) for v in sig)))
