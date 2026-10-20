"""Banco de efectos de sonido del reel, sintetizados (sin derechos de terceros).

Uso (desde video/):
    python scripts/sfx.py

Escribe en public/sfx/:
    whoosh      barrido de aire con paneo, para cortes y paneles
    swish       barrido corto y agudo, para textos que golpean
    impacto     golpe cinematografico grave
    subdrop     caida de sub grave, bajo los impactos grandes
    reverso     crescendo en reversa que desemboca en un corte
    brillo      destellos agudos tipo campana, para la luz y el logo
    tick        click seco, para palabras que aparecen
    obturador   obturador de camara, para las fotos
    pop         burbuja ascendente, para el correo / Instagram
    glitch      tartamudeo digital corto
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(3)


def t(d):
    return np.arange(int(d * SR)) / SR


def filtro(x, fc, tipo="lp", orden=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    f[0] = 1e-6
    g = 1 / np.sqrt(1 + (f / fc) ** (2 * orden)) if tipo == "lp" else 1 / np.sqrt(1 + (fc / f) ** (2 * orden))
    return np.fft.irfft(X * g, len(x))


def barrido(x, desde, hasta, curva=1.0):
    """Pasa-bajos que se mueve en el tiempo (por bloques)."""
    paso = int(0.01 * SR)
    out = np.zeros_like(x)
    for i in range(0, len(x), paso):
        k = (i / len(x)) ** curva
        fc = desde * (hasta / desde) ** k
        bloque = x[max(0, i - paso) : i + paso * 2]
        y = filtro(bloque, fc)
        off = i - max(0, i - paso)
        out[i : i + paso] = y[off : off + paso][: len(out[i : i + paso])]
    return out


def reverb(x, dur=1.4):
    ir = rng.standard_normal(int(dur * SR)) * np.exp(-t(dur) * (6.9 / dur))
    ir = filtro(ir, 6000)
    ir /= np.sqrt(np.sum(ir**2))
    n = len(x) + len(ir)
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)


def guardar(nombre, l, r=None):
    r = l if r is None else r
    st = np.stack([l, r], axis=1)
    st = st / (np.max(np.abs(st)) + 1e-9) * 0.9
    st[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
    with wave.open(str(OUT / f"{nombre}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"{nombre}.wav  {len(l) / SR:.2f}s")


def campana(f, d):
    tt = t(d)
    return sum(np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * (3 + m)) * a for m, a in ((1, 1), (2.76, 0.4), (5.4, 0.2)))


OUT.mkdir(parents=True, exist_ok=True)

# whoosh: ruido que se abre y se cierra, cruzando de izquierda a derecha.
d = 0.7
tt = t(d)
env = np.sin(np.pi * np.minimum(1, tt / d)) ** 2.2
x = barrido(rng.standard_normal(len(tt)), 300, 6000, 0.7) * env
x += barrido(rng.standard_normal(len(tt)), 200, 2500, 1.0) * env * 0.6
pan = np.linspace(-0.9, 0.9, len(tt))
guardar("whoosh", x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4))

# swish: corto y agudo.
d = 0.3
tt = t(d)
x = filtro(rng.standard_normal(len(tt)), 2500, "hp") * np.sin(np.pi * tt / d) ** 3
guardar("swish", x)

# impacto: boom + cuerpo + cola de sala.
d = 2.2
tt = t(d)
boom = np.sin(2 * np.pi * np.cumsum(34 + 110 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 2.2)
cuerpo = filtro(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 7)
crack = filtro(rng.standard_normal(len(tt)), 3000, "hp") * np.exp(-tt * 40) * 0.6
x = np.tanh((boom * 1.2 + cuerpo * 0.7 + crack) * 1.6)
x = x + reverb(x)[: len(x)] * 0.25
guardar("impacto", x)

# subdrop.
d = 1.3
tt = t(d)
x = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tt * 2.2) + 28) / SR) * np.exp(-tt * 2.0)
guardar("subdrop", np.tanh(x * 1.5))

# reverso: platillo/ruido al reves que crece hasta el corte.
d = 1.0
tt = t(d)
plat = filtro(rng.standard_normal(len(tt)), 4000, "hp") * np.exp(-tt * 4)
plat += campana(1800, d) * 0.3
x = reverb(plat)[: len(tt)] * 0.6 + plat
x = x[::-1] * np.linspace(0.2, 1, len(tt))
guardar("reverso", x)

# brillo: arpegio de campanas agudas con cola.
d = 2.0
x = np.zeros(int(d * SR))
for i, f in enumerate((1760, 2217, 2637, 3520, 2960)):
    s = campana(f, d - i * 0.06)
    x[int(i * 0.06 * SR) : int(i * 0.06 * SR) + len(s)] += s * (0.9 - i * 0.1)
x = x + reverb(x, 2.2)[: len(x)] * 0.6
guardar("brillo", x, np.roll(x, int(0.012 * SR)))

# tick.
d = 0.06
tt = t(d)
x = (np.sin(2 * np.pi * 2400 * tt) * 0.6 + filtro(rng.standard_normal(len(tt)), 3000, "hp")) * np.exp(-tt * 140)
guardar("tick", x)

# obturador: dos clicks mecanicos + aire.
d = 0.32
x = np.zeros(int(d * SR))
for i0, f in ((0.0, 1900), (0.11, 1500)):
    tt = t(0.07)
    s = (filtro(rng.standard_normal(len(tt)), 1200, "hp") + np.sin(2 * np.pi * f * tt) * 0.5) * np.exp(-tt * 90)
    x[int(i0 * SR) : int(i0 * SR) + len(s)] += s
guardar("obturador", x)

# pop: burbuja que sube.
d = 0.2
tt = t(d)
x = np.sin(2 * np.pi * np.cumsum(500 + 1300 * (tt / d) ** 0.6) / SR) * np.exp(-tt * 22)
guardar("pop", x)

# glitch: fragmentos de ruido y tono cortados.
d = 0.32
x = np.zeros(int(d * SR))
pos = 0
while pos < len(x):
    largo = int(rng.uniform(0.008, 0.03) * SR)
    if rng.random() > 0.35:
        tt = t(largo / SR)
        s = np.sign(np.sin(2 * np.pi * rng.uniform(200, 1800) * tt)) * 0.5 + rng.standard_normal(len(tt)) * 0.3
        x[pos : pos + len(s)] = s[: len(x) - pos]
    pos += largo
guardar("glitch", filtro(x, 7000))
