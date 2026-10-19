"""Musica original del reel, sintetizada con numpy (sin derechos de terceros).

Uso (desde video/, despues de scripts/voz.py):
    python scripts/musica.py

Arma un tema electronico a `bpm` de guion.json sobre la misma grilla de
beats que usan las escenas, de modo que cada corte del video cae en un golpe:

  gancho    -> impacto + tension (drone y subida) que desemboca en el drop
  materia.. -> groove completo: bombo, palmas, hats, bajo con "sidechain",
               arpegio y pad en La menor (Am - F - C - G)
              + un golpe en cada palabra de "Luz. Sombra. Materia."
  marca     -> quiebre: cae la bateria, queda el pad, impacto en el logo
  cta       -> vuelve el pulso suave y cierra con un ultimo impacto

Escribe public/musica.wav (estereo, 44.1 kHz).
"""

import json
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
GUION = json.loads((RAIZ / "guion.json").read_text(encoding="utf-8"))
VOZ = {v["id"]: v for v in json.loads((RAIZ / "src" / "voz.generated.json").read_text(encoding="utf-8"))}

SR = 44100
BPM = GUION["bpm"]
BEAT = 60 / BPM
ENTRADA_VOZ = GUION.get("entradaVozMs", 60) / 1000
rng = np.random.default_rng(7)

# ---- Grilla: beat de inicio de cada escena ----
inicio = {}
b = 0
for e in GUION["escenas"]:
    inicio[e["id"]] = b
    b += e["beats"]
TOTAL_BEATS = b
COLA = 1.2  # segundos de cola despues del ultimo beat (se corta en el video)
N = int((TOTAL_BEATS * BEAT + COLA) * SR)
mix_l = np.zeros(N)
mix_r = np.zeros(N)


def t(segundos):
    return np.arange(int(segundos * SR)) / SR


def add(sonido, en_seg, vol=1.0, pan=0.0):
    """Suma un sonido mono en un instante, con paneo (-1 izq, 1 der)."""
    i = int(en_seg * SR)
    if i >= N:
        return
    s = sonido[: N - i] * vol
    mix_l[i : i + len(s)] += s * np.sqrt((1 - pan) / 2) * 1.414
    mix_r[i : i + len(s)] += s * np.sqrt((1 + pan) / 2) * 1.414


def pasa_bajos(x, fc, orden=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** (2 * orden)), len(x))


def pasa_altos(x, fc, orden=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    f[0] = 1e-6
    return np.fft.irfft(X / np.sqrt(1 + (fc / f) ** (2 * orden)), len(x))


def saw(freq, tt):
    # Sierra suavizada con pocos armonicos (sin aliasing audible).
    s = np.zeros_like(tt)
    for k in range(1, 12):
        if freq * k > SR / 2.5:
            break
        s += np.sin(2 * np.pi * freq * k * tt) / k
    return s * 0.6


def nota(n):
    """Numero MIDI -> frecuencia."""
    return 440 * 2 ** ((n - 69) / 12)


# ---- Instrumentos ----
def bombo():
    tt = t(0.45)
    f = 45 + 110 * np.exp(-tt * 28)
    fase = 2 * np.pi * np.cumsum(f) / SR
    cuerpo = np.sin(fase) * np.exp(-tt * 7)
    click = pasa_altos(rng.standard_normal(len(tt)), 2000) * np.exp(-tt * 300) * 0.25
    return np.tanh((cuerpo + click) * 1.6) * 0.9


def palma():
    tt = t(0.25)
    ruido = pasa_bajos(pasa_altos(rng.standard_normal(len(tt)), 900), 4500)
    env = np.zeros_like(tt)
    for d in (0, 0.011, 0.022):
        env += np.where(tt >= d, np.exp(-(tt - d) * 60), 0) * (0.6 if d < 0.02 else 1)
    env += np.exp(-tt * 14) * 0.35
    return ruido * env * 0.32


def hat(abierto=False):
    tt = t(0.22 if abierto else 0.05)
    r = pasa_altos(rng.standard_normal(len(tt)), 7000, 3)
    return r * np.exp(-tt * (14 if abierto else 90)) * (0.16 if abierto else 0.1)


def impacto(dur=2.2):
    tt = t(dur)
    f = 30 + 70 * np.exp(-tt * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2)
    ruido = pasa_bajos(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 5) * 0.5
    brillo = pasa_altos(rng.standard_normal(len(tt)), 5000) * np.exp(-tt * 3.5) * 0.12
    return np.tanh((boom + ruido + brillo) * 1.4) * 0.85


def subida(dur):
    """Riser: ruido que se abre y un tono que sube, crece hasta el final."""
    tt = t(dur)
    trozos = []
    paso = int(0.05 * SR)
    ruido = rng.standard_normal(len(tt))
    for i in range(0, len(tt), paso):
        fc = 400 + 9000 * (i / len(tt)) ** 2
        trozos.append(pasa_bajos(ruido[i : i + paso], fc))
    r = np.concatenate(trozos)[: len(tt)]
    tono = np.sin(2 * np.pi * np.cumsum(220 + 900 * (tt / dur) ** 2) / SR) * 0.25
    env = (tt / dur) ** 2.2
    return (r * 0.5 + tono) * env * 0.55


def pluck(freq, dur=0.32):
    tt = t(dur)
    s = saw(freq, tt) * np.exp(-tt * 11)
    return pasa_bajos(s, 2600) * 0.22


def bajo(freq, dur):
    tt = t(dur)
    s = np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * freq * 2 * tt)
    env = np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.03)
    return np.tanh(s * 1.3) * env * 0.42


def pad(freqs, dur):
    tt = t(dur)
    s = sum(saw(f * d, tt) for f in freqs for d in (0.997, 1.003))
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (dur - tt) / 0.5)
    return pasa_bajos(s, 1100) * env * 0.07


# ---- Armonia: La menor ----
ACORDES = [  # (raiz del bajo, notas del arpegio, notas del pad) en MIDI
    (33, [57, 60, 64, 69], [57, 60, 64]),  # Am
    (29, [53, 57, 60, 65], [53, 57, 60]),  # F
    (36, [60, 64, 67, 72], [55, 60, 64]),  # C
    (31, [55, 59, 62, 67], [55, 59, 62]),  # G
]

seg = lambda beat: beat * BEAT  # noqa: E731

GROOVE = (inicio["materia"], inicio["marca"])  # bateria completa
QUIEBRE = (inicio["marca"], inicio["cta"])
FINAL = (inicio["cta"], TOTAL_BEATS)

kicks = []
for beat in range(TOTAL_BEATS):
    compas = beat // 4
    acorde = ACORDES[compas % 4]
    en_groove = GROOVE[0] <= beat < GROOVE[1]
    en_final = FINAL[0] <= beat < FINAL[1]

    if en_groove or en_final:
        add(bombo(), seg(beat))
        kicks.append(seg(beat))
    if en_groove and beat % 2 == 1:
        add(palma(), seg(beat), pan=0.05)
    if en_groove:
        add(hat(abierto=True), seg(beat + 0.5), pan=0.25)
        for s16 in (0.25, 0.75):
            add(hat(), seg(beat + s16), pan=-0.3)
    # Bajo en corcheas (entra con el groove).
    if en_groove or en_final:
        for k in (0, 0.5):
            add(bajo(nota(acorde[0]), BEAT * 0.45), seg(beat + k))
    # Arpegio en semicorcheas durante el groove.
    if en_groove:
        for k in range(4):
            n = acorde[1][(beat * 4 + k) % 4]
            add(pluck(nota(n)), seg(beat + k / 4), pan=0.4 if k % 2 else -0.4)
    # Pad: un acorde por compas en todo el tema salvo el gancho.
    if beat % 4 == 0 and beat >= inicio["materia"]:
        add(pad([nota(x) for x in acorde[2]], BEAT * 4 + 0.4), seg(beat))

# ---- Gancho: drone grave + subida hasta el drop ----
gancho = inicio["gancho"]
add(impacto(2.4), seg(gancho), 0.9)
drone = pad([nota(45), nota(52), nota(57)], seg(4) + 0.3)
add(drone * 2.2, seg(gancho))
add(subida(seg(4)), seg(gancho))
add(impacto(2.0), seg(inicio["materia"]), 0.75)

# ---- Un golpe por palabra en "Luz. Sombra. Materia." ----
for w in VOZ["materia"]["palabras"]:
    add(impacto(1.2), seg(inicio["materia"]) + ENTRADA_VOZ + w["startMs"] / 1000 - 0.02, 0.45)

# ---- Quiebre en la marca: subida corta antes, impacto en el logo ----
add(subida(seg(2)), seg(QUIEBRE[0] - 2), 0.8)
add(impacto(3.0), seg(QUIEBRE[0]), 0.95)
add(subida(seg(2)), seg(FINAL[0] - 2), 0.6)
add(impacto(2.5), seg(TOTAL_BEATS - 2), 0.7)

# ---- "Sidechain": el bajo y el pad respiran con el bombo ----
env = np.ones(N)
tt = np.arange(N) / SR
for k in kicks:
    d = tt - k
    m = (d >= 0) & (d < 0.4)
    env[m] = np.minimum(env[m], 1 - 0.55 * np.exp(-d[m] / 0.09))
mix_l *= 0.6 + 0.4 * env
mix_r *= 0.6 + 0.4 * env

# ---- Eco estereo suave + master ----
eco = int(BEAT * 0.75 * SR)
l, r = mix_l.copy(), mix_r.copy()
l[eco:] += mix_r[:-eco] * 0.18
r[eco:] += mix_l[:-eco] * 0.18
salida = np.stack([l, r], axis=1)
salida /= np.max(np.abs(salida)) + 1e-9
salida = np.tanh(salida * 1.15) * 0.89
salida[-int(COLA * SR):] *= np.linspace(1, 0, int(COLA * SR))[:, None]

archivo = RAIZ / "public" / "musica.wav"
with wave.open(str(archivo), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((salida * 32767).astype(np.int16).tobytes())
print(f"musica.wav: {len(salida) / SR:.1f}s, {TOTAL_BEATS} beats a {BPM} bpm")
