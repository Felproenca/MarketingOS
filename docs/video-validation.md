# Video validation status

The MediaOS video adapter is connected to the existing EditorOS pipeline.

Validated before artifact registration:

- a real source reached EditorOS ingest, transcription, candidate selection and FFmpeg rendering;
- the adapter rejects aborted pipelines and stale delivery files;
- partial MP4 files are not registered in Supabase;
- the production worker has no artificial four-minute execution limit.

E2E completed on 2026-08-17 with job `aa1ce94e-aeb5-4ccc-bd7a-2baa3773c7ce`: EditorOS produced one 30-second 1080x1920 MP4, MediaOS uploaded it to Storage, and artifact `489a50ec-2351-49d4-9da2-731ce955ee4d` version 1 was registered. Storage returned HTTP 200 and video QA passed. Fresh-source transcription remains a long-running workload, so production execution stays asynchronous.
