"""Musica original del reel, sintetizada con numpy (sin derechos de terceros).

Uso (desde video/, despues de scripts/voz.py):
    python scripts/musica.py

Tech-house cinematografico a `bpm` de guion.json, armado sobre la misma
grilla de beats que las escenas (cada corte cae en un golpe):

  gancho     filtro cerrado que se abre + subida -> DROP en "materia"
  materia..  bombo en capas, palmas con cola, hats con swing, bajo
             sincopado con sidechain, acordes "stab" con eco y un
             gancho melodico desde "escuelas"
  marca      quiebre: pad abierto, bajo sostenido, subida al final
  cta        ultimo drop y cierre con impacto y cola de reverb

Escribe public/musica.wav (estereo, 44.1 kHz). Los efectos sueltos
(whoosh, impactos, etc.) estan en scripts/sfx.py.
"""

import json
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
GUION = json.loads((RAIZ / "guion.json").read_text(encoding="utf-8"))

SR = 44100
BPM = GUION["bpm"]
BEAT = 60 / BPM
rng = np.random.default_rng(11)

inicio = {}
b = 0
for e in GUION["escenas"]:
    inicio[e["id"]] = b
    b += e["beats"]
TOTAL = b
COLA = 1.6
N = int((TOTAL * BEAT + COLA) * SR)


class Bus:
    """Pista estereo con envio a reverb."""

    def __init__(self):
        self.l = np.zeros(N)
        self.r = np.zeros(N)

    def add(self, s, seg, vol=1.0, pan=0.0):
        i = int(seg * SR)
        if i >= N or i < 0:
            return
        s = s[: N - i] * vol
        self.l[i : i + len(s)] += s * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.r[i : i + len(s)] += s * np.sin((pan + 1) * np.pi / 4) * 1.414


def t(d):
    return np.arange(int(d * SR)) / SR


def filtro(x, fc, tipo="lp", orden=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    f[0] = 1e-6
    g = 1 / np.sqrt(1 + (f / fc) ** (2 * orden)) if tipo == "lp" else 1 / np.sqrt(1 + (fc / f) ** (2 * orden))
    return np.fft.irfft(X * g, len(x))


def saw(freq, tt, armonicos=24):
    s = np.zeros_like(tt)
    for k in range(1, armonicos):
        if freq * k > SR / 2.4:
            break
        s += np.sin(2 * np.pi * freq * k * tt) / k
    return s * 0.55


def nota(n):
    return 440 * 2 ** ((n - 69) / 12)


def reverb(x, dur=2.2, oscuro=5000):
    """Reverb por convolucion con respuesta sintetica (ruido que decae)."""
    ir = rng.standard_normal(int(dur * SR)) * np.exp(-t(dur) * (6.9 / dur))
    ir = filtro(ir, oscuro)
    ir /= np.sqrt(np.sum(ir**2))
    n = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return y


# ------------------------------------------------------------------ sonidos
def bombo():
    tt = t(0.6)
    f = 46 + 160 * np.exp(-tt * 32)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5.5)
    golpe = filtro(rng.standard_normal(len(tt)), 3500) * np.exp(-tt * 180) * 0.5
    return np.tanh((sub * 1.2 + golpe) * 2.0) * 0.95


def palma():
    tt = t(0.35)
    ruido = filtro(filtro(rng.standard_normal(len(tt)), 1100, "hp"), 6000)
    env = sum(np.where(tt >= d, np.exp(-(tt - d) * 70), 0) for d in (0, 0.009, 0.019))
    env += np.exp(-tt * 11) * 0.5
    cuerpo = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 30) * 0.4
    return (ruido * env + cuerpo) * 0.35


def hat(abierto=False, vel=1.0):
    tt = t(0.28 if abierto else 0.06)
    r = filtro(rng.standard_normal(len(tt)), 8000, "hp", 3)
    metal = sum(np.sign(np.sin(2 * np.pi * f * tt)) for f in (5400, 7250, 8930)) * 0.08
    return (r + metal) * np.exp(-tt * (11 if abierto else 85)) * (0.15 if abierto else 0.09) * vel


def bajo(freq, dur):
    tt = t(dur)
    sub = np.sin(2 * np.pi * freq * tt)
    reese = saw(freq * 1.004, tt, 14) + saw(freq * 0.996, tt, 14)
    reese = filtro(reese, 420)
    env = np.minimum(1, tt / 0.006) * np.exp(-tt * 2.5) * np.minimum(1, (dur - tt) / 0.02)
    return np.tanh((sub * 0.9 + reese * 0.7) * 1.6) * env * 0.5


def stab(freqs, dur=0.42):
    tt = t(dur)
    s = sum(saw(f * d, tt) for f in freqs for d in (0.994, 1.0, 1.006))
    corte = 900 + 5000 * np.exp(-tt * 18)
    # filtro con barrido: se aproxima mezclando dos cortes
    brillante = filtro(s, 5000)
    opaco = filtro(s, 900)
    w = np.exp(-tt * 18)
    s = brillante * w + opaco * (1 - w)
    del corte
    return s * np.exp(-tt * 6) * 0.055


def lead(freq, dur):
    tt = t(dur)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt / 0.15)
    fase = 2 * np.pi * np.cumsum(freq * vib) / SR
    s = sum(np.sin(fase * k) / k for k in range(1, 9)) * 0.55
    s = filtro(s, 3200)
    env = np.minimum(1, tt / 0.01) * np.exp(-tt * 1.6) * np.minimum(1, (dur - tt) / 0.03)
    return s * env * 0.16


def pad(freqs, dur):
    tt = t(dur)
    s = sum(saw(f * d, tt) for f in freqs for d in (0.993, 1.0, 1.007))
    env = np.minimum(1, tt / 0.8) * np.minimum(1, (dur - tt) / 0.6)
    return filtro(s, 1600) * env * 0.05


def subida(dur):
    tt = t(dur)
    ruido = rng.standard_normal(len(tt))
    trozos = []
    paso = int(0.04 * SR)
    for i in range(0, len(tt), paso):
        trozos.append(filtro(ruido[i : i + paso], 300 + 11000 * (i / len(tt)) ** 2.2))
    r = np.concatenate(trozos)[: len(tt)]
    tono = np.sin(2 * np.pi * np.cumsum(180 + 1400 * (tt / dur) ** 2.4) / SR) * 0.22
    return (r * 0.55 + tono) * (tt / dur) ** 2.4 * 0.6


def impacto(dur=2.5):
    tt = t(dur)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 90 * np.exp(-tt * 7)) / SR) * np.exp(-tt * 1.8)
    cuerpo = filtro(rng.standard_normal(len(tt)), 1500) * np.exp(-tt * 6) * 0.6
    aire = filtro(rng.standard_normal(len(tt)), 4500, "hp") * np.exp(-tt * 2.8) * 0.15
    return np.tanh((boom + cuerpo + aire) * 1.8) * 0.9


# ------------------------------------------------------------------ armonia
# La menor: Am - F - C - G. (bajo, acorde stab, notas del pad)
ACORDES = [
    (33, [57, 60, 64], [45, 52, 57, 60]),
    (29, [57, 60, 65], [41, 48, 53, 57]),
    (36, [55, 60, 64], [48, 55, 60, 64]),
    (31, [55, 59, 62], [43, 50, 55, 59]),
]
# Gancho melodico (un compas por acorde), en semicorcheas: (paso, nota, largo)
MOTIVO = [
    [(0, 76, 3), (3, 74, 1), (4, 72, 2), (6, 69, 2), (10, 72, 2), (12, 74, 4)],
    [(0, 72, 3), (3, 69, 1), (4, 72, 2), (6, 77, 4), (12, 76, 4)],
    [(0, 76, 3), (3, 79, 1), (4, 76, 2), (6, 72, 4), (12, 74, 4)],
    [(0, 74, 3), (3, 71, 1), (4, 74, 2), (6, 79, 4), (12, 76, 4)],
]

seg = lambda beat: beat * BEAT  # noqa: E731
DROP1 = (inicio["materia"], inicio["marca"])
QUIEBRE = (inicio["marca"], inicio["cta"])
DROP2 = (inicio["cta"], TOTAL)
MELODIA_DESDE = inicio["escuelas"]

bat, graves, armon, fx = Bus(), Bus(), Bus(), Bus()
kicks = []

for beat in range(TOTAL):
    compas = beat // 4
    ac = ACORDES[compas % 4]
    drop = DROP1[0] <= beat < DROP1[1] or DROP2[0] <= beat < DROP2[1]
    intro = beat < DROP1[0]

    if drop or intro:
        bat.add(bombo(), seg(beat), 0.55 if intro else 1.0)
        kicks.append(seg(beat))
    if drop and beat % 2 == 1:
        bat.add(palma(), seg(beat), pan=0.05)
    if drop or intro:
        bat.add(hat(abierto=True), seg(beat + 0.5), 0.8 if intro else 1, pan=0.3)
    if drop:
        for k, s16 in enumerate((0.25, 0.75)):
            swing = 0.03 if k else 0
            bat.add(hat(vel=0.6 + 0.4 * rng.random()), seg(beat + s16 + swing), pan=-0.35)
        # Bajo sincopado: contratiempo + recogida en la ultima semicorchea.
        graves.add(bajo(nota(ac[0]), BEAT * 0.42), seg(beat + 0.5))
        if beat % 4 == 3:
            graves.add(bajo(nota(ac[0] + 12), BEAT * 0.2), seg(beat + 0.75), 0.7)
        # Stabs en contratiempo con paneo alterno.
        if beat % 2 == 0:
            armon.add(stab([nota(n) for n in ac[1]]), seg(beat + 0.5), pan=-0.25)
        else:
            armon.add(stab([nota(n) for n in ac[1]]), seg(beat + 0.75), 0.8, pan=0.25)
    if beat % 4 == 0 and not intro:
        armon.add(pad([nota(n) for n in ac[2]], BEAT * 4 + 0.6), seg(beat), 1.6 if not drop else 1.0)
    # Gancho melodico desde "escuelas" y en el drop final.
    if beat % 4 == 0 and drop and beat >= MELODIA_DESDE:
        for paso, n, largo in MOTIVO[compas % 4]:
            armon.add(lead(nota(n), largo * BEAT / 4 + 0.05), seg(beat + paso / 4), pan=0.1)

# Quiebre: bajo largo y respirado.
for beat in range(QUIEBRE[0], QUIEBRE[1], 4):
    ac = ACORDES[(beat // 4) % 4]
    graves.add(bajo(nota(ac[0]), BEAT * 4) * 0.8, seg(beat))

# Transiciones.
fx.add(impacto(), seg(0), 0.9)
fx.add(subida(seg(DROP1[0])), 0, 0.9)
fx.add(impacto(), seg(DROP1[0]), 0.85)
fx.add(subida(seg(2)), seg(QUIEBRE[0] - 2), 0.8)
fx.add(impacto(3.0), seg(QUIEBRE[0]), 1.0)
fx.add(subida(seg(4)), seg(DROP2[0] - 4), 0.85)
fx.add(impacto(), seg(DROP2[0]), 0.8)
fx.add(impacto(3.0), seg(TOTAL - 1), 0.9)

# Sidechain: graves y armonia respiran con el bombo.
env = np.ones(N)
tt = np.arange(N) / SR
for k in kicks:
    d = tt - k
    m = (d >= 0) & (d < 0.42)
    env[m] = np.minimum(env[m], 1 - 0.72 * np.exp(-d[m] / 0.1))
for bus, prof in ((graves, 1.0), (armon, 0.7)):
    e = 1 - prof * (1 - env)
    bus.l *= e
    bus.r *= e

# Intro con filtro cerrado que se abre hasta el drop.
fin_intro = int(seg(DROP1[0]) * SR)
for bus in (bat,):
    for canal in (bus.l, bus.r):
        cerrado = filtro(canal[:fin_intro], 700)
        w = np.linspace(0, 1, fin_intro) ** 3
        canal[:fin_intro] = cerrado * (1 - w) + canal[:fin_intro] * w

# Eco ritmico en la armonia (corchea con puntillo, cruzado).
eco = int(BEAT * 0.75 * SR)
for _ in range(1):
    l, r = armon.l.copy(), armon.r.copy()
    armon.l[eco:] += r[:-eco] * 0.32
    armon.r[eco:] += l[:-eco] * 0.32

# Reverb: poca en bateria, mas en armonia y efectos.
mezcla_l = bat.l + graves.l + armon.l + fx.l
mezcla_r = bat.r + graves.r + armon.r + fx.r
envio_l = bat.l * 0.08 + armon.l * 0.35 + fx.l * 0.4
envio_r = bat.r * 0.08 + armon.r * 0.35 + fx.r * 0.4
mezcla_l += reverb(envio_l) * 0.9
mezcla_r += reverb(envio_r) * 0.9

salida = np.stack([mezcla_l, mezcla_r], axis=1)
salida = filtro(salida[:, 0], 28, "hp"), filtro(salida[:, 1], 28, "hp")
salida = np.stack(salida, axis=1)
salida /= np.percentile(np.abs(salida), 99.7) + 1e-9
salida = np.tanh(salida * 0.9) * 0.92  # limitador suave
salida[-int(COLA * SR):] *= np.linspace(1, 0, int(COLA * SR))[:, None]

archivo = RAIZ / "public" / "musica.wav"
with wave.open(str(archivo), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(salida, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"musica.wav: {len(salida) / SR:.1f}s, {TOTAL} beats a {BPM} bpm")
