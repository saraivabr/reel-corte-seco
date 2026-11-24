#!/bin/bash
# Uma vez por máquina: cria o Python da skill (numpy + opencv) em <skill>/.venv
SK="$(cd "$(dirname "$0")/.." && pwd)"; [ -x "$SK/.venv/bin/python" ] || { uv venv --python 3.12 "$SK/.venv" -q && uv pip install --python "$SK/.venv/bin/python" -q numpy "opencv-python-headless>=4.8,<5"; }
"$SK/.venv/bin/python" -c "import cv2,numpy;print('python da skill ok, opencv',cv2.__version__)"
