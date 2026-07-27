import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def main() -> None:
    parser = argparse.ArgumentParser(description="Transcribe a directory with faster-whisper.")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--model", default="small")
    parser.add_argument("--language", default="pt")
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8", local_files_only=True)

    for audio_path in sorted(args.input_dir.glob("*.ogg")):
        stem = audio_path.stem
        if (args.output_dir / f"{stem}.txt").exists() and (args.output_dir / f"{stem}.json").exists():
            print(f"Skipped existing: {audio_path.name}", flush=True)
            continue
        segments, info = model.transcribe(
            str(audio_path),
            language=args.language,
            beam_size=5,
            vad_filter=True,
        )
        segment_data = []
        transcript_parts = []
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue
            transcript_parts.append(text)
            segment_data.append({"start": segment.start, "end": segment.end, "text": text})

        (args.output_dir / f"{stem}.txt").write_text(" ".join(transcript_parts), encoding="utf-8")
        (args.output_dir / f"{stem}.json").write_text(
            json.dumps(
                {
                    "source": str(audio_path),
                    "language": info.language,
                    "language_probability": info.language_probability,
                    "duration": info.duration,
                    "segments": segment_data,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        print(f"Transcribed: {audio_path.name}", flush=True)


if __name__ == "__main__":
    main()
