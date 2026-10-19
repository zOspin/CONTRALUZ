"""Genera la voz en off de cada escena con edge-tts (voces neuronales de
Microsoft, gratis) y los tiempos palabra por palabra para los subtitulos.

Uso (desde la carpeta video/):
    python scripts/voz.py

Lee guion.json y escribe:
    public/voz/<escena>.mp3      audio de cada escena
    src/voz.generated.json       duracion y palabras con tiempos (ms)

Despues corre `python scripts/musica.py`: la musica se arma sobre la
misma grilla de beats y necesita saber cuanto dura cada escena.
"""

import asyncio
import json
from pathlib import Path

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent
GUION = json.loads((RAIZ / "guion.json").read_text(encoding="utf-8"))
SALIDA_AUDIO = RAIZ / "public" / "voz"
SALIDA_DATOS = RAIZ / "src" / "voz.generated.json"

# edge-tts entrega tiempos en unidades de 100 ns.
TICKS_POR_MS = 10_000


async def generar(escena: dict) -> dict:
    com = edge_tts.Communicate(
        escena["texto"],
        GUION["voz"],
        rate=GUION.get("velocidad", "+0%"),
        pitch=GUION.get("tono", "+0Hz"),
        boundary="WordBoundary",
    )
    audio = bytearray()
    palabras = []
    async for parte in com.stream():
        if parte["type"] == "audio":
            audio.extend(parte["data"])
        elif parte["type"] == "WordBoundary":
            inicio = parte["offset"] / TICKS_POR_MS
            fin = (parte["offset"] + parte["duration"]) / TICKS_POR_MS
            palabras.append(
                {"text": parte["text"], "startMs": round(inicio), "endMs": round(fin)}
            )

    (SALIDA_AUDIO / f"{escena['id']}.mp3").write_bytes(audio)
    fin_voz = palabras[-1]["endMs"] if palabras else 0
    beat_ms = 60000 / GUION["bpm"]
    cabe = escena["beats"] * beat_ms
    aviso = "" if fin_voz + 250 <= cabe else f"  <- NO CABE en {escena['beats']} beats ({cabe:.0f} ms)"
    print(f"{escena['id']}: {fin_voz / 1000:.2f}s{aviso}")
    return {"id": escena["id"], "vozMs": fin_voz, "palabras": palabras}


async def main() -> None:
    SALIDA_AUDIO.mkdir(parents=True, exist_ok=True)
    for viejo in SALIDA_AUDIO.glob("*.mp3"):
        viejo.unlink()
    datos = [await generar(e) for e in GUION["escenas"]]
    SALIDA_DATOS.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")


asyncio.run(main())
