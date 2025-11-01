# requisitos: pip install gTTS pydub
from gtts import gTTS
from pydub import AudioSegment
import os

# 1) gerar a voz
text = "Preee‑tin!"
tts = gTTS(text=text, lang='pt‑br', slow=False)
tts_file = "voz.mp3"
tts.save(tts_file)

# 2) carregar fundo musical
# Coloque um arquivo MP3 ou WAV de fundo no mesmo diretório, ex: fundo.mp3
fundo = AudioSegment.from_file("fundo.mp3")
voz = AudioSegment.from_file(tts_file)

# 3) opcional: ajustar volumes
fundo = fundo - 10  # reduzir 10dB para a voz sobressair
voz = voz + 5     # aumentar voz 5dB

# 4) cortar ou ajustar duração do fundo se necessário
fundo = fundo[:len(voz)]  # deixar fundo no comprimento da voz

# 5) mixar
resultado = fundo.overlay(voz, position=0)

# 6) exportar resultado
output_file = "pretin_jingle.mp3"
resultado.export(output_file, format="mp3")

print(f"Áudio gerado: {output_file}")
