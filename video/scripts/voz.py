"""Genera la voz en off de cada escena con edge-tts (voces neuronales de
Microsoft, gratis) y los tiempos palabra por palabra para los subtitulos.

Uso (desde la carpeta video/):
    python scripts/voz.py

Lee guion.json y escribe:
    public/voz/<escena>.mp3      audio de cada escena
    src/voz.generated.json       duracion y palabras con tiempos (ms)
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
    # Fin de la voz = fin de la ultima palabra (el mp3 trae un poco de cola).
    fin_voz = palabras[-1]["endMs"] if palabras else 0
    print(f"{escena['id']}: {fin_voz / 1000:.2f}s, {len(palabras)} palabras")
    return {"id": escena["id"], "vozMs": fin_voz, "palabras": palabras}


async def main() -> None:
    SALIDA_AUDIO.mkdir(parents=True, exist_ok=True)
    datos = [await generar(e) for e in GUION["escenas"]]
    SALIDA_DATOS.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(d["vozMs"] for d in datos) / 1000
    print(f"total voz: {total:.1f}s")


asyncio.run(main())
