# Publishing validation

Publishing is connected to MediaOS with an explicit approval gate.

Validated on 2026-08-17:

- Job `ed415a10-dc45-4118-9bf4-610ad6f23a74` was blocked because artifact `489a50ec-2351-49d4-9da2-731ce955ee4d` was still `review`.
- No Meta publisher command was called.
- The executor requires `artifact.status=approved`, an HTTPS preview URL and a caption. Dry-run is the default; external execution additionally requires explicit confirmation.
